# AI Context Platforms: scene layers

Scope: one slide, `ai-context-platforms-2027`. All 22 semantic objects and ten directional edges remain defined through `slides.json` and the graph adapter.

- A, global atmosphere: theme-derived gradient wash, distant waves and particles, behind all semantic material. This layer has no copy, directional arrows or independent relationships.
- B, spatial lights: 16 lights and shadows generated from actual node bounding boxes by the context decorator; hub horizon also derives from the context box. Moving/resizing a node updates its glow without an alternate coordinate registry.
- C, canonical relationship glow: engine renders ambient and narrow lumen strokes using the exact same computed `path` attribute as each of the ten edge tracks. The graph is not duplicated.
- D, semantic object surfaces: separate glass/highlight rectangles and masked, catalogued per-node WebP resources. Images remain swappable through `visual-assets.json`, not flattened into slide art.
- E, crisp UI: semantic titles, labels and arrowheads render after all environment layers. No group-level blur is applied to any text; reduced-motion and forced-colors degrade decorative effects.

`standard` keeps atmosphere hidden, `rich` keeps a restrained object aura and vector artwork, and `rich-image` reveals the integrated atmosphere, local lighting, image fragments and canonical edge lumens. Scene IDs, boxes and relationships are invariant across these choices.

The original portrait and agent fragments are still the weakest assets. They are blended with their vector motifs and their rectangular edges are feathered, but genuine asset replacement remains a separate art-direction task. No whole-slide generated image is used.

Verification: `scripts/check-context-atlas.mjs` checks geometry-linked lights and semantic graph; `scripts/check-visual-pilot.mjs` captures three style screenshots plus advanced light/dark; export checks run in Chromium and WebKit via GitHub Actions.

The outdated, pre-rendered whole-slide image was withdrawn from the approved illustration manifest after the editorial change. Its old digest remains as provenance, while the live modular SVG remains the rendered and export-tested source.

Visual review rejected repeated oval floor shadows and ornamental hub rings because they resembled extra visual relationships. The advanced treatment now uses only diffuse node lighting, while real edges remain the only directional strokes. A browser bounding-box check verifies the outcome titles and the bottom governance marker clearance.
