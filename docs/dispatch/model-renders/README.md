# Dispatch HVAC 3D Model Registry

This folder contains verification renders generated from the GLB assets used by the dispatch demo.

Blender CLI is not installed in the current Codex environment, so these PNGs are rendered from the same Blender-openable GLB files through Three.js/Chrome with Draco decoding enabled. The source models can be imported directly into Blender.

## Source Models

- Ventilation unit: `public/models/equipment/supply-vent-unit-01-assembled.glb`
- Ventilation unit exploded source: `public/models/equipment/supply-vent-unit-01-exploded.glb`
- Chiller: `public/models/dispatch/chiller.glb`
- Fan coil: `public/models/dispatch/fancoil-fc92.glb`
- Cooling tower: `public/models/dispatch/cooling-tower-small.glb`
- Multi-split conditioner: `public/models/dispatch/multi-split-system.glb`

## Render Set

- `ahu-pv1-assembled.png`
- `ahu-pv1-exploded.png`
- `chiller-assembled.png`
- `chiller-exploded.png`
- `fancoil-fc92-assembled.png`
- `fancoil-fc92-exploded.png`
- `cooling-tower-small-assembled.png`
- `cooling-tower-small-exploded.png`
- `multi-split-system-assembled.png`
- `multi-split-system-exploded.png`

Regenerate with:

```bash
node scripts/render-dispatch-models.mjs
```
