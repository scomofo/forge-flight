# Forge Flight explanatory animations — pack 01

Twelve authored, equation-driven sequences, supplied as GIF, H.264 MP4 and PNG
stills under `public/learn-media/` at repository root. The pack complements the
existing SVG lesson figures; it does not replace them or start extra animations
automatically in lessons.

The source and typed React usage examples are here so the media remain editable.
The manifest records lesson/concept targets, alt text, teaching points, dimensions,
duration and model limitations. No font binaries are bundled.

## Rebuild

Install FFmpeg, Python 3.10+, Pillow and NumPy, plus local fonts with the needed
math glyphs. Optional `FF_FONT`, `FF_BOLD`, `FF_MATH` and `FF_SERIF` environment
variables select local font paths. Font and encoder versions can affect binary
hashes without changing the lesson sequence.

```sh
python -m pip install -r tools/lesson-animations/source/requirements.txt
python tools/lesson-animations/source/render.py
python tools/lesson-animations/source/verify_assets.py
python tools/lesson-animations/source/package_gallery.py
mkdir -p public/learn-media
cp tools/lesson-animations/public/learn-media/* public/learn-media/
```

Render a single sequence with `--only 01-equality-balance`. The source exporter
writes its own local `public/learn-media` for a self-contained preview; the copy
step makes those assets directly servable by the app.

The React player example defaults to an explicit play action, supplies native
video controls and a still-image mode, and supports reduced-motion preferences.
Do not replace those controls with an endlessly autoplaying GIF in lesson text.
Use the GIF exports where a video player is not supported.

## Contents

1. Equality balance
2. Rearranging stress for area
3. Factor-label unit cancellation
4. Squared-unit conversion
5. Length, area and volume scaling
6. Slope and intercept
7. Vector components
8. Radians
9. Static and kinetic friction
10. Stress versus area
11. Beam depth and deflection
12. Potential and kinetic energy

Run `source/verify_assets.py` to decode every media file and check the arithmetic.
The generated report is recorded in `review/asset-validation.json`. Original
asset-pack validation is not presented as verification of the full application.
