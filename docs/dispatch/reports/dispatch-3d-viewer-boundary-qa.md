# Dispatch 3D Viewer Boundary QA

Date: 2026-05-30  
Branch: `fix/dispatch-3d-equipment-models-and-selection`  
Scope: `/dispatch` 3D viewer boundaries and review clarity.

## Why This Exists

The `/dispatch` preview currently has two separate 3D areas:

1. Primary PV-1 3D passport at the top of the page.
2. Lower 3D equipment twin selector inside the dispatch dashboard.

These areas intentionally do not share one active model state. The top PV-1 passport remains PV-1. The lower equipment
twin selector is the area controlled by equipment cards such as chiller, fan coil, cooling tower, and multi-split.

## Stable Markers

The DOM now exposes explicit scopes for review automation:

```text
data-testid="dispatch-primary-pv1-viewer"
data-viewer-scope="primary-pv1-passport"

data-testid="dispatch-equipment-twin-selector"
data-viewer-scope="equipment-twin-selector"
```

The lower selector also exposes:

```text
data-active-twin-id="<selected equipment twin id>"
data-related-twin-ids="<comma-separated related twin ids>"
```

## Automated Check

Run:

```text
DISPATCH_BASE_URL=<preview-url> node scripts/asset-qa/verify-dispatch-preview-suite.mjs
```

The suite runs the static preview smoke, the equipment card-state smoke, and this boundary verifier sequentially.
This matters because the browser-based checks share one `agent-browser` context and should not be launched in parallel.

The boundary verifier opens `/dispatch`, clicks `multi-split-system`, and confirms:

- primary PV-1 viewer still exists and remains PV-1;
- lower equipment twin selector switches to `Мультисплит система MS-1`;
- active equipment twin card is `multi-split-system`;
- both viewer areas keep a mounted canvas;
- lower selector does not show fallback text.

## Product Rule

When reviewing screenshots:

- top area = PV-1 passport viewer;
- lower area = equipment twin selector;
- equipment card clicks should be judged in the lower area.

This is a QA boundary marker only. It does not add real equipment control and does not change the read-only demo
positioning over existing BMS/SCADA.
