#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error("Usage: node scripts/asset-qa/inspect-glb.mjs <path-to-model.glb>");
  process.exit(1);
}

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK_TYPE = 0x4e4f534a;

function bytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

function parseGlb(buffer) {
  if (buffer.readUInt32LE(0) !== GLB_MAGIC) {
    throw new Error("Not a GLB file: invalid magic header.");
  }

  const version = buffer.readUInt32LE(4);
  const declaredLength = buffer.readUInt32LE(8);
  let offset = 12;
  let json;

  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkType === JSON_CHUNK_TYPE) {
      json = JSON.parse(buffer.slice(chunkStart, chunkEnd).toString("utf8"));
    }

    offset = chunkEnd;
  }

  if (!json) throw new Error("GLB has no JSON chunk.");
  return { version, declaredLength, json };
}

function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      for (let i = 0; i < 4; i += 1) {
        out[col * 4 + row] += a[i * 4 + row] * b[col * 4 + i];
      }
    }
  }
  return out;
}

function translationMatrix([x, y, z]) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function scaleMatrix([x, y, z]) {
  return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
}

function rotationMatrixFromQuaternion([x, y, z, w]) {
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;

  return [
    1 - (yy + zz),
    xy + wz,
    xz - wy,
    0,
    xy - wz,
    1 - (xx + zz),
    yz + wx,
    0,
    xz + wy,
    yz - wx,
    1 - (xx + yy),
    0,
    0,
    0,
    0,
    1,
  ];
}

function nodeMatrix(node) {
  if (node.matrix) return node.matrix;

  const t = translationMatrix(node.translation ?? [0, 0, 0]);
  const r = rotationMatrixFromQuaternion(node.rotation ?? [0, 0, 0, 1]);
  const s = scaleMatrix(node.scale ?? [1, 1, 1]);
  return multiply(multiply(t, r), s);
}

function transformPoint(matrix, [x, y, z]) {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
  ];
}

function createBounds() {
  return {
    min: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    max: [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  };
}

function expandBounds(bounds, point) {
  for (let axis = 0; axis < 3; axis += 1) {
    bounds.min[axis] = Math.min(bounds.min[axis], point[axis]);
    bounds.max[axis] = Math.max(bounds.max[axis], point[axis]);
  }
}

function mergeBounds(bounds, other) {
  expandBounds(bounds, other.min);
  expandBounds(bounds, other.max);
}

function boundsFromAccessor(accessor, matrix) {
  if (!accessor?.min || !accessor?.max) return null;

  const [minX, minY, minZ] = accessor.min;
  const [maxX, maxY, maxZ] = accessor.max;
  const corners = [
    [minX, minY, minZ],
    [minX, minY, maxZ],
    [minX, maxY, minZ],
    [minX, maxY, maxZ],
    [maxX, minY, minZ],
    [maxX, minY, maxZ],
    [maxX, maxY, minZ],
    [maxX, maxY, maxZ],
  ];
  const bounds = createBounds();
  corners.forEach((corner) => expandBounds(bounds, transformPoint(matrix, corner)));
  return bounds;
}

function boundsSize(bounds) {
  return bounds.max.map((value, index) => value - bounds.min[index]);
}

function boundsCenter(bounds) {
  return bounds.max.map((value, index) => (value + bounds.min[index]) / 2);
}

function volume(bounds) {
  const [x, y, z] = boundsSize(bounds);
  return Math.max(x, 0) * Math.max(y, 0) * Math.max(z, 0);
}

function length([x, y, z]) {
  return Math.hypot(x, y, z);
}

function roundTuple(values) {
  return values.map((value) => Number(value.toFixed(4)));
}

function primitiveKey(primitive) {
  const attributes = Object.entries(primitive.attributes ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, index]) => `${name}:${index}`)
    .join("|");
  return `material:${primitive.material ?? "none"};indices:${primitive.indices ?? "none"};${attributes}`;
}

const buffer = await readFile(inputPath);
const { version, declaredLength, json: gltf } = parseGlb(buffer);

const meshNodes = [];
const sceneBounds = createBounds();
const primitiveKeys = new Map();
let primitiveCount = 0;
let missingNormalPrimitives = 0;
let indexedPrimitiveCount = 0;
let totalVertices = 0;

const sceneIndex = gltf.scene ?? 0;
const scene = gltf.scenes?.[sceneIndex];
const rootNodes = scene?.nodes ?? gltf.nodes?.map((_, index) => index) ?? [];

function visitNode(nodeIndex, parentMatrix = identity()) {
  const node = gltf.nodes?.[nodeIndex];
  if (!node) return;

  const worldMatrix = multiply(parentMatrix, nodeMatrix(node));

  if (typeof node.mesh === "number") {
    const mesh = gltf.meshes?.[node.mesh];
    const nodeBounds = createBounds();
    let hasBounds = false;

    for (const primitive of mesh?.primitives ?? []) {
      primitiveCount += 1;
      primitiveKeys.set(primitiveKey(primitive), (primitiveKeys.get(primitiveKey(primitive)) ?? 0) + 1);
      if (typeof primitive.indices === "number") indexedPrimitiveCount += 1;
      if (typeof primitive.attributes?.NORMAL !== "number") missingNormalPrimitives += 1;

      const positionAccessor = gltf.accessors?.[primitive.attributes?.POSITION];
      if (positionAccessor?.count) totalVertices += positionAccessor.count;

      const primitiveBounds = boundsFromAccessor(positionAccessor, worldMatrix);
      if (primitiveBounds) {
        mergeBounds(nodeBounds, primitiveBounds);
        mergeBounds(sceneBounds, primitiveBounds);
        hasBounds = true;
      }
    }

    meshNodes.push({
      nodeIndex,
      meshIndex: node.mesh,
      nodeName: node.name ?? `(node ${nodeIndex})`,
      meshName: mesh?.name ?? `(mesh ${node.mesh})`,
      primitiveCount: mesh?.primitives?.length ?? 0,
      materialIndexes: [...new Set((mesh?.primitives ?? []).map((primitive) => primitive.material).filter(Number.isInteger))],
      bounds: hasBounds ? nodeBounds : null,
    });
  }

  for (const childIndex of node.children ?? []) {
    visitNode(childIndex, worldMatrix);
  }
}

rootNodes.forEach((nodeIndex) => visitNode(nodeIndex));

const overallSize = boundsSize(sceneBounds);
const overallCenter = boundsCenter(sceneBounds);
const diagonal = length(overallSize);
const mainVolume = volume(sceneBounds);
const tinyThreshold = Math.max(mainVolume * 0.00003, 0.000001);
const farThreshold = diagonal * 0.68;

const tinyMeshes = meshNodes
  .filter((node) => node.bounds && volume(node.bounds) > 0 && volume(node.bounds) < tinyThreshold)
  .map((node) => ({
    node: node.nodeName,
    mesh: node.meshName,
    size: roundTuple(boundsSize(node.bounds)),
    center: roundTuple(boundsCenter(node.bounds)),
  }));

const farMeshes = meshNodes
  .filter((node) => node.bounds && length(boundsCenter(node.bounds).map((value, index) => value - overallCenter[index])) > farThreshold)
  .map((node) => ({
    node: node.nodeName,
    mesh: node.meshName,
    center: roundTuple(boundsCenter(node.bounds)),
    distanceFromCenter: Number(length(boundsCenter(node.bounds).map((value, index) => value - overallCenter[index])).toFixed(4)),
  }));

const duplicatePrimitiveKeys = [...primitiveKeys.entries()]
  .filter(([, count]) => count > 1)
  .map(([key, count]) => ({ count, key }));

const lights =
  gltf.extensions?.KHR_lights_punctual?.lights ??
  gltf.extensions?.["KHR_lights_punctual"]?.lights ??
  [];

const warnings = [];
if (buffer.length > 25 * 1024 * 1024) warnings.push("File is above the 25 MB hard MVP limit.");
if (buffer.length > 10 * 1024 * 1024) warnings.push("File is above the preferred 10 MB target.");
if (gltf.cameras?.length) warnings.push("Cameras are present in the GLB.");
if (lights.length) warnings.push("Punctual lights are present in the GLB.");
if (missingNormalPrimitives) warnings.push(`${missingNormalPrimitives}/${primitiveCount} primitives do not export NORMAL attributes; shading quality may be inconsistent.`);
if (tinyMeshes.length) warnings.push(`${tinyMeshes.length} tiny mesh node(s) detected; inspect for floating screws/fragments.`);
if (farMeshes.length) warnings.push(`${farMeshes.length} far-away mesh node(s) detected; inspect for scene junk or off-center fragments.`);
if (duplicatePrimitiveKeys.length) warnings.push(`${duplicatePrimitiveKeys.length} duplicate primitive signature(s) detected; inspect for duplicated CAD geometry.`);
if (Math.abs(overallCenter[0]) > overallSize[0] * 0.1 || Math.abs(overallCenter[2]) > overallSize[2] * 0.1) {
  warnings.push("Bounding-box center is noticeably offset from origin in X/Z.");
}

const nodeRows = meshNodes
  .filter((node) => node.bounds)
  .map((node) => ({
    node: node.nodeName,
    mesh: node.meshName,
    primitives: node.primitiveCount,
    size: roundTuple(boundsSize(node.bounds)),
    center: roundTuple(boundsCenter(node.bounds)),
    volume: Number(volume(node.bounds).toFixed(6)),
    materials: node.materialIndexes.map((index) => gltf.materials?.[index]?.name ?? `material ${index}`),
  }))
  .sort((a, b) => b.volume - a.volume);

const report = {
  file: basename(inputPath),
  path: inputPath,
  fileSize: bytes(buffer.length),
  fileSizeBytes: buffer.length,
  glbVersion: version,
  declaredLength,
  generator: gltf.asset?.generator ?? null,
  scene: {
    meshNodeCount: meshNodes.length,
    meshCount: gltf.meshes?.length ?? 0,
    primitiveCount,
    indexedPrimitiveCount,
    materialCount: gltf.materials?.length ?? 0,
    accessorCount: gltf.accessors?.length ?? 0,
    totalPositionVertices: totalVertices,
    cameraCount: gltf.cameras?.length ?? 0,
    lightCount: lights.length,
    rootNodeCount: rootNodes.length,
  },
  bounds: {
    min: roundTuple(sceneBounds.min),
    max: roundTuple(sceneBounds.max),
    size: roundTuple(overallSize),
    center: roundTuple(overallCenter),
    diagonal: Number(diagonal.toFixed(4)),
    originToCenterDistance: Number(length(overallCenter).toFixed(4)),
  },
  materials: (gltf.materials ?? []).map((material, index) => ({
    index,
    name: material.name ?? `(material ${index})`,
    alphaMode: material.alphaMode ?? "OPAQUE",
    doubleSided: Boolean(material.doubleSided),
  })),
  topMeshNodesByVolume: nodeRows.slice(0, 14),
  suspicious: {
    tinyMeshes,
    farMeshes,
    duplicatePrimitiveKeys,
    missingNormalPrimitives,
  },
  suitability: {
    assembledOnly:
      warnings.some((warning) => warning.includes("far-away") || warning.includes("Cameras") || warning.includes("Lights"))
        ? "REVIEW"
        : "LIKELY_OK",
    explodedView: "REVIEW_REQUIRED_BY_VISUAL_QA",
  },
  warnings,
};

console.log(JSON.stringify(report, null, 2));
