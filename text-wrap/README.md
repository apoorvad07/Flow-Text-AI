# FlowText AI

Interactive magazine-style text wrapping app built with Cheng Lou's Pretext, HTML5 Canvas, JavaScript, Vite, HTML, and CSS.

## Features

- Pretext-powered article wrapping around draggable images
- Smooth requestAnimationFrame rendering
- Dark mode with persistence
- Reset confirmation
- PNG, JPEG, and browser print-to-PDF export
- User article editor with live words, characters, and reading time
- Image upload, drag-and-drop replacement, deletion, reset, drag, and resize
- Desktop/tablet canvas layout plus mobile stacked article layout
- Statistics panel with render time, canvas size, line count, export count, and saved status
- Keyboard shortcuts: Ctrl+S save, Ctrl+E export PNG, Esc reset

## Install

```bash
npm install
npm install @chenglou/pretext
npm run dev
```

## Architecture

- `main.js`: App wiring and shared state
- `render.js`: Pretext canvas layout and mobile article rendering
- `drag.js`: Smooth image dragging
- `resize.js`: Aspect-ratio image resizing
- `storage.js`: Local Storage workspace persistence
- `editor.js`: Article editor
- `export.js`: PNG, JPEG, and PDF export
- `theme.js`: Dark/light mode
- `stats.js`: Statistics panel
- `utils.js`: Small shared helpers

## Future Improvements

- Add true multi-page PDF generation
- Add image captions
- Add undo/redo history
- Add selectable article templates
