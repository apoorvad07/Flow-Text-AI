# FlowText AI

FlowText AI is an interactive magazine-style article layout engine built using JavaScript, HTML, CSS, Vite, and Cheng Lou's Pretext library.

Instead of displaying text in a normal column, the application automatically reflows the article around images, creating a clean magazine-like reading experience.

---
## Live Demo

**Try it here:** https://flow-text-ai.vercel.app/

## Preview

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/5fcc8511-773b-442b-9951-2052cc25d06e" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/81820c66-2a7a-4d14-a22b-c4912a85f257" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/f08df40a-964d-46e6-b135-db1143d75c4b" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/7dd7e56d-7a1a-4083-b594-9488d9fc78a6" />



---

## Features

- Dynamic text wrapping around images
- Drag and drop image positioning
- Automatic text reflow
- Dark Mode
- Reset Layout button
- Responsive interface
- Modern magazine-style article layout
- Smooth and clean user interface
- Users can upload their own article
- Users can add their own images
- Built using Pretext layout engine

---

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Vite
- Cheng Lou's Pretext Library

---

## How it Works

The application prepares article text using the Pretext library.

Whenever an image is moved, the program:

1. Detects the new image position.
2. Calculates obstacle regions.
3. Recomputes available text space.
4. Renders the article again.
5. Produces a smooth magazine-style layout.

This happens in real time while dragging images.

---

## Installation

Clone the repository

```bash
git clone https://github.com/apoorvad07/Flow-Text-AI.git
```

Move into the project

```bash
cd Flow-Text-AI
```

Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

---

## Future Improvements

- Export article as PDF
- Export article as Image
- Better mobile optimization
- Multiple layout templates
- More animation effects
- AI generated article summaries
- AI assisted layout suggestions

---

## Project Structure

```
Flow-Text-AI
│
├── public/
├── src/
│ ├── assets/
│ ├── main.js
│ ├── style.css
│
├── index.html
├── package.json
└── README.md
```

---

## Learning Outcomes

This project helped me understand:

- Dynamic text rendering
- Canvas rendering
- Image positioning
- DOM manipulation
- JavaScript event handling
- Responsive UI design
- Vite project setup
- Git and GitHub workflow

---

## Author

**Apoorva Dwivedi**

---
