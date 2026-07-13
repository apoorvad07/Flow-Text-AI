import "./style.css";

import {
  prepareWithSegments,
  layoutNextLineRange,
  materializeLineRange,
} from "@chenglou/pretext";

const STORAGE_KEY = "flowtext-ai-workspace-single-js";

const BODY_FONT = "20px Merriweather, Georgia, serif";
const BODY_LINE = 34;
const HEAD_FONT = "700 28px Inter, Arial, sans-serif";
const HEAD_LINE = 38;
const CANVAS_WIDTH = 800;
const PAD = 50;
const IMAGE_GAP = 22;
const SECTION_GAP = 34;
const PARA_GAP = 16;

const DEFAULT_ARTICLE = `AI in Everyday Life

Artificial intelligence has rapidly evolved from an ambitious scientific concept into one of the most transformative technologies of the 21st century. Today, AI powers virtual assistants, recommends what we watch and listen to, detects fraud in banking, assists doctors in diagnosing diseases, and helps scientists accelerate groundbreaking research.

As technology continues to advance, artificial intelligence is becoming an essential part of everyday life, changing how people learn, work, communicate, and solve problems.

The Power of Data

One of the greatest strengths of AI is its ability to analyze enormous amounts of data in seconds. Humans can recognize patterns through experience, but AI systems can process millions of data points at once, uncovering insights that would otherwise remain hidden.

This ability allows businesses to make informed decisions, optimize operations, improve customer experiences, and discover new opportunities across countless industries.

Healthcare and Human Support

Healthcare is among the sectors benefiting most from artificial intelligence. Modern AI models assist doctors by analyzing medical scans, identifying early signs of disease, predicting health risks, and recommending personalized treatment plans.

AI-powered wearable devices can monitor patients continuously and provide real-time insights that help prevent medical emergencies before they occur. AI is not replacing healthcare professionals; it is becoming an invaluable assistant that improves accuracy and saves time.

Education and Software Development

Education is experiencing a remarkable transformation. Intelligent learning platforms adapt lessons to match each student's pace and learning style, making education more personalized than ever before.

Software development has entered a new era with AI-powered tools. Developers use intelligent assistants to generate code suggestions, identify programming errors, automate testing, and improve application performance.

Cybersecurity and Digital Trust

Cybersecurity is another field where artificial intelligence is making a significant impact. Every day, organizations face millions of attempted cyberattacks, making it nearly impossible for human analysts to monitor every threat manually.

AI systems continuously analyze network traffic, detect suspicious activity, identify malware, and respond to potential attacks within seconds. By learning from previous incidents, these systems improve over time and help organizations strengthen their digital defenses.

Ethics, Responsibility, and the Future

Despite its remarkable capabilities, artificial intelligence raises important ethical questions. Concerns about privacy, data security, algorithmic bias, misinformation, and transparency continue to challenge researchers, governments, and technology companies worldwide.

Artificial intelligence should not be viewed as a replacement for human creativity, but as a powerful tool that amplifies human potential. The greatest innovations of the future will emerge from collaboration between intelligent machines and imaginative people working together to solve meaningful challenges.`;

const DEFAULT_IMAGES = {
  img1: { left: 520, top: 210, width: 260, height: 200, src: "/images/robot.jpg" },
  img2: { left: 42, top: 780, width: 240, height: 180, src: "/images/coding.jpg" },
  img3: { left: 500, top: 1360, width: 260, height: 200, src: "/images/cyber.jpg" },
};

const container = document.getElementById("container");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const frames = ["img1", "img2", "img3"].map((id) =>
  document.getElementById(`frame-${id}`)
);
const editor = document.getElementById("articleEditor");

let state = loadState();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      theme: saved.theme || "light",
      article: saved.article || DEFAULT_ARTICLE,
      images: { ...clone(DEFAULT_IMAGES), ...(saved.images || {}) },
      exportCount: saved.exportCount || 0,
      savedAt: saved.savedAt || null,
    };
  } catch {
    return {
      theme: "light",
      article: DEFAULT_ARTICLE,
      images: clone(DEFAULT_IMAGES),
      exportCount: 0,
      savedAt: null,
    };
  }
}

function saveState() {
  state.savedAt = new Date().toLocaleTimeString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function articleMetrics(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;

  return {
    words,
    characters: trimmed.length,
    paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0,
    readingTime: Math.max(1, Math.ceil(words / 220)),
  };
}

function parseArticle(rawText) {
  const blocks = rawText
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const sections = [];
  let current = null;

  for (const block of blocks) {
    const isHeading = block.length < 80 && !/[.!?]$/.test(block);

    if (isHeading || !current) {
      current = { heading: block, paragraphs: [] };
      sections.push(current);
    } else {
      current.paragraphs.push(block.replace(/\s+/g, " "));
    }
  }

  return sections;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function rafThrottle(fn) {
  let pending = false;

  return () => {
    if (pending) return;

    pending = true;

    requestAnimationFrame(() => {
      pending = false;
      fn();
    });
  };
}

function applyTheme() {
  document.body.classList.toggle("dark-mode", state.theme === "dark");
  document.getElementById("themeBtn").textContent =
    state.theme === "dark" ? "Light" : "Dark";
}

function applyImages() {
  frames.forEach((frame) => {
    const id = frame.id.replace("frame-", "");
    const data = state.images[id];
    const img = frame.querySelector("img");

    frame.style.left = `${data.left}px`;
    frame.style.top = `${data.top}px`;
    frame.style.width = `${data.width}px`;
    frame.style.height = `${data.height}px`;
    frame.classList.toggle("is-hidden", Boolean(data.hidden));
    img.src = data.src;
  });
}

function colors() {
  const dark = document.body.classList.contains("dark-mode");

  return {
    paper: dark ? "#1f1f1f" : "#fffdf8",
    text: dark ? "#f5f5f5" : "#2a2a2a",
    heading: dark ? "#ffffff" : "#111827",
    accent: dark ? "#60a5fa" : "#2563eb",
  };
}

function getObstacles() {
  const base = container.getBoundingClientRect();

  return frames
    .filter((frame) => !frame.classList.contains("is-hidden"))
    .map((frame) => {
      const rect = frame.getBoundingClientRect();

      return {
        top: rect.top - base.top,
        bottom: rect.bottom - base.top,
        left: rect.left - base.left,
        right: rect.right - base.left,
      };
    });
}

function textBoxAt(y, lineHeight, obstacles) {
  let left = PAD;
  let right = CANVAS_WIDTH - PAD;

  for (const obs of obstacles) {
    if (y + lineHeight <= obs.top || y >= obs.bottom) continue;

    const obsCenter = (obs.left + obs.right) / 2;

    if (obsCenter > CANVAS_WIDTH / 2) {
      right = Math.min(right, obs.left - IMAGE_GAP);
    } else {
      left = Math.max(left, obs.right + IMAGE_GAP);
    }
  }

  return {
    x: left,
    width: Math.max(90, right - left),
  };
}

function wrapHeading(text, maxWidth) {
  ctx.font = HEAD_FONT;

  const lines = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;

    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);

  return lines;
}

function layoutParagraph(text, y, obstacles, lines) {
  const prepared = prepareWithSegments(text, BODY_FONT);
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };

  while (true) {
    const box = textBoxAt(y, BODY_LINE, obstacles);
    const range = layoutNextLineRange(prepared, cursor, box.width);

    if (!range) break;

    const line = materializeLineRange(prepared, range);

    lines.push({
      type: "body",
      text: line.text,
      x: box.x,
      y,
    });

    cursor = range.end;
    y += BODY_LINE;
  }

  return y + PARA_GAP;
}

function renderCanvas() {
  const start = performance.now();
  const sections = parseArticle(state.article);
  const obstacles = getObstacles();
  const lines = [];
  let y = PAD;

  for (const section of sections) {
    const headBox = textBoxAt(y, HEAD_LINE, obstacles);

    lines.push({
      type: "rule",
      x: headBox.x,
      y,
      width: Math.min(76, headBox.width),
    });

    y += 14;

    for (const head of wrapHeading(section.heading, headBox.width)) {
      const box = textBoxAt(y, HEAD_LINE, obstacles);

      lines.push({
        type: "heading",
        text: head,
        x: box.x,
        y,
      });

      y += HEAD_LINE;
    }

    y += 10;

    for (const paragraph of section.paragraphs) {
      y = layoutParagraph(paragraph, y, obstacles, lines);
    }

    y += SECTION_GAP;
  }

  const height = y + PAD;
  const dpr = window.devicePixelRatio || 1;
  const c = colors();

  canvas.width = CANVAS_WIDTH * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${CANVAS_WIDTH}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, CANVAS_WIDTH, height);
  ctx.textBaseline = "top";

  for (const line of lines) {
    if (line.type === "rule") {
      ctx.fillStyle = c.accent;
      ctx.fillRect(line.x, line.y, line.width, 4);
    } else {
      ctx.font = line.type === "heading" ? HEAD_FONT : BODY_FONT;
      ctx.fillStyle = line.type === "heading" ? c.heading : c.text;
      ctx.fillText(line.text, line.x, line.y);
    }
  }

  return {
    canvasSize: `${CANVAS_WIDTH} x ${Math.round(height)}`,
    renderedLines: lines.filter((line) => line.text).length,
    renderTime: `${Math.round(performance.now() - start)} ms`,
  };
}

function renderMobileArticle() {
  const root = document.getElementById("mobileArticle");
  const sections = parseArticle(state.article);

  root.innerHTML = "";

  sections.slice(0, 6).forEach((section, index) => {
    if (index < 3) {
      const image = document.createElement("img");
      image.src = state.images[`img${index + 1}`]?.src || "";
      image.alt = `Article image ${index + 1}`;
      root.append(image);
    }

    const block = document.createElement("article");

    block.innerHTML = `
      <h2>${section.heading}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    `;

    root.append(block);
  });
}

function renderEditorStats() {
  const metrics = articleMetrics(editor.value);

  document.getElementById("editorWords").textContent = metrics.words;
  document.getElementById("editorChars").textContent = metrics.characters;
  document.getElementById("editorTime").textContent = metrics.readingTime;
}

function renderStats(renderInfo) {
  const metrics = articleMetrics(state.article);

  const rows = {
    Words: metrics.words,
    Characters: metrics.characters,
    Paragraphs: metrics.paragraphs,
    "Reading Time": `${metrics.readingTime} min`,
    Images: Object.values(state.images).filter((image) => !image.hidden).length,
    "Canvas Size": renderInfo.canvasSize,
    "Rendered Lines": renderInfo.renderedLines,
    "Current Theme": state.theme,
    "Saved Status": state.savedAt ? `Saved ${state.savedAt}` : "Unsaved",
    "Export Count": state.exportCount,
    "Render Time": renderInfo.renderTime,
  };

  document.getElementById("statsPanel").innerHTML = Object.entries(rows)
    .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)
    .join("");
}

function renderAll() {
  const renderInfo = renderCanvas();
  renderMobileArticle();
  renderStats(renderInfo);
}

const scheduleRender = rafThrottle(() => {
  renderAll();
  saveState();
});

function enableDrag(frame) {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  frame.addEventListener("pointerdown", (event) => {
    if (event.target.classList.contains("resize-handle")) return;

    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;

    frame.classList.add("is-dragging");
    frame.setPointerCapture(event.pointerId);
  });

  frame.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const id = frame.id.replace("frame-", "");
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;

    lastX = event.clientX;
    lastY = event.clientY;

    state.images[id].left += dx;
    state.images[id].top += dy;

    frame.style.left = `${state.images[id].left}px`;
    frame.style.top = `${state.images[id].top}px`;

    scheduleRender();
  });

  frame.addEventListener("pointerup", (event) => {
    dragging = false;
    frame.classList.remove("is-dragging");
    frame.releasePointerCapture(event.pointerId);
  });
}

function enableResize(frame) {
  const handle = frame.querySelector(".resize-handle");

  let resizing = false;
  let startX = 0;
  let startWidth = 0;
  let ratio = 1;

  handle.addEventListener("pointerdown", (event) => {
    event.stopPropagation();

    resizing = true;
    startX = event.clientX;
    startWidth = frame.offsetWidth;
    ratio = frame.offsetHeight / frame.offsetWidth;

    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!resizing) return;

    const id = frame.id.replace("frame-", "");
    const width = Math.max(140, Math.min(380, startWidth + event.clientX - startX));
    const height = width * ratio;

    state.images[id].width = width;
    state.images[id].height = height;

    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;

    document.getElementById("imageSize").value = Math.round(width);
    scheduleRender();
  });

  handle.addEventListener("pointerup", (event) => {
    resizing = false;
    handle.releasePointerCapture(event.pointerId);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function replaceImage(file) {
  if (!file) return;

  const id = document.getElementById("imageSelect").value;

  state.images[id].src = await fileToDataUrl(file);
  state.images[id].hidden = false;

  applyImages();
  scheduleRender();
  showToast("Image replaced");
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = filename;
  link.click();
}

async function buildExportCanvas() {
  const scale = 2;
  const heroHeight = 520;
  const output = document.createElement("canvas");
  const out = output.getContext("2d");

  output.width = canvas.width;
  output.height = canvas.height + heroHeight;

  out.fillStyle = document.body.classList.contains("dark-mode") ? "#121212" : "#f5f7fa";
  out.fillRect(0, 0, output.width, output.height);

  out.fillStyle = document.body.classList.contains("dark-mode") ? "#ffffff" : "#111827";
  out.textAlign = "center";
  out.font = "700 84px Georgia";
  out.fillText("The Future of Artificial Intelligence", output.width / 2, 120);
  out.font = "32px Arial";
  out.fillText("Dynamic text reflow using Cheng Lou's Pretext", output.width / 2, 175);

  out.drawImage(canvas, 0, heroHeight);

  const base = container.getBoundingClientRect();

  for (const frame of frames.filter((item) => !item.classList.contains("is-hidden"))) {
    const image = frame.querySelector("img");
    const rect = frame.getBoundingClientRect();

    try {
      out.drawImage(
        image,
        (rect.left - base.left) * scale,
        (rect.top - base.top) * scale + heroHeight,
        rect.width * scale,
        rect.height * scale
      );
    } catch {
      showToast("Export skipped one protected image");
    }
  }

  return output;
}

async function exportLayout(type) {
  const exportCanvas = await buildExportCanvas();

  if (type === "pdf") {
    const win = window.open("", "_blank");

    win.document.write(`
      <img src="${exportCanvas.toDataURL("image/png")}" style="width:100%" onload="print()" />
    `);
  } else {
    const mime = type === "jpeg" ? "image/jpeg" : "image/png";

    downloadDataUrl(
      exportCanvas.toDataURL(mime, 0.95),
      `flowtext-ai.${type === "jpeg" ? "jpg" : "png"}`
    );
  }

  state.exportCount += 1;
  saveState();
  renderAll();
  showToast(`${type.toUpperCase()} export ready`);
}

document.getElementById("currentDate").textContent = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
}).format(new Date());

editor.value = state.article;

editor.addEventListener("input", renderEditorStats);

document.getElementById("updateArticleBtn").addEventListener("click", () => {
  state.article = editor.value;
  scheduleRender();
  showToast("Article updated");
});

document.getElementById("themeBtn").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  scheduleRender();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset layout, images, and saved settings?")) return;

  localStorage.removeItem(STORAGE_KEY);
  state = loadState();

  editor.value = state.article;

  applyTheme();
  applyImages();
  renderEditorStats();
  renderAll();

  showToast("Layout reset");
});

document.getElementById("imageSize").addEventListener("input", (event) => {
  const id = document.getElementById("imageSelect").value;
  const image = state.images[id];
  const ratio = image.height / image.width;

  image.width = Number(event.target.value);
  image.height = image.width * ratio;

  applyImages();
  scheduleRender();
});

document.getElementById("deleteImageBtn").addEventListener("click", () => {
  state.images[document.getElementById("imageSelect").value].hidden = true;

  applyImages();
  scheduleRender();
});

document.getElementById("resetImageBtn").addEventListener("click", () => {
  const id = document.getElementById("imageSelect").value;

  state.images[id] = { ...DEFAULT_IMAGES[id] };

  applyImages();
  scheduleRender();
});

document.getElementById("imageUpload").addEventListener("change", (event) => {
  replaceImage(event.target.files[0]);
});

document.getElementById("dropZone").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.getElementById("dropZone").addEventListener("drop", (event) => {
  event.preventDefault();
  replaceImage(event.dataTransfer.files[0]);
});

document.getElementById("exportPngBtn").addEventListener("click", () => {
  exportLayout("png");
});

document.getElementById("exportJpegBtn").addEventListener("click", () => {
  exportLayout("jpeg");
});

document.getElementById("exportPdfBtn").addEventListener("click", () => {
  exportLayout("pdf");
});

window.addEventListener("resize", scheduleRender);
window.addEventListener("scroll", scheduleRender, { passive: true });

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveState();
    renderAll();
    showToast("Workspace saved");
  }

  if (event.ctrlKey && event.key.toLowerCase() === "e") {
    event.preventDefault();
    exportLayout("png");
  }

  if (event.key === "Escape") {
    document.getElementById("resetBtn").click();
  }
});

frames.forEach((frame) => {
  enableDrag(frame);
  enableResize(frame);
});

applyTheme();
applyImages();
renderEditorStats();
renderAll();