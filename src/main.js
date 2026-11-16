import { createPlayer, liveFeature, orientationLockFeature, streamTypeFeature } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';
import './style.css';

const { PlayerElement: FormaPlayer } = createPlayer({
  features: [...videoFeatures, liveFeature, streamTypeFeature, orientationLockFeature],
});
customElements.define('forma-player', FormaPlayer);
// Register the Video.js elements after the player has upgraded so their
// context requests bind to the player instead of being lost during startup.
await import('./videojs-elements.js');

const films = {
  joyride: {
    name: 'Big Buck Bunny', label: 'BIG BUCK BUNNY', color: '#547849', shape: 'wide',
    playbackId: import.meta.env.VITE_MUX_PLAYBACK_ID_BIG_BUCK_BUNNY?.trim() || 'cTHWdt0138su1T79PPQm3Fv7Xq01ulHRSiBF3uCQ0035iY',
  },
  wildrobot: {
    name: 'The Wild Robot', label: 'THE WILD ROBOT', color: '#6652a5', shape: 'wide',
    playbackId: import.meta.env.VITE_MUX_PLAYBACK_ID_THE_WILD_ROBOT?.trim() || 'A5ugjeNDHJsfPhiZVjDHrZGJ01gQXkvIcPYqtd9csZWE',
  },
};

const ratios = {
  wide: { width: 16, height: 9, label: '16:9', direction: 'LANDSCAPE' },
  square: { width: 1, height: 1, label: '1:1', direction: 'SQUARE' },
  vintage: { width: 4, height: 3, label: '4:3', direction: 'VINTAGE' },
};

const player = document.querySelector('.canvas-player');
const media = document.querySelector('#canvas-video');
const orientationSelect = document.querySelector('#orientation-lock-select');
const muxAnalyticsToggle = document.querySelector('#mux-analytics-toggle');
const muxData = document.querySelector('#forma-mux-data');
const analyticsPreferenceKey = 'forma:mux-analytics-enabled';
let muxAnalyticsOptIn = false;
try { muxAnalyticsOptIn = localStorage.getItem(analyticsPreferenceKey) === 'true'; } catch { /* Analytics stays off when browser storage is unavailable. */ }
muxAnalyticsToggle.checked = muxAnalyticsOptIn;
if (import.meta.env.VITE_MUX_DATA_ENV_KEY?.trim()) muxData.envKey = import.meta.env.VITE_MUX_DATA_ENV_KEY.trim();
if (!muxAnalyticsOptIn) muxData.remove();
muxAnalyticsToggle.addEventListener('change', () => {
  const enabled = muxAnalyticsToggle.checked;
  try { localStorage.setItem(analyticsPreferenceKey, String(enabled)); } catch { /* The current choice still applies for this page. */ }
  if (enabled) player.append(muxData);
  else muxData.remove();
  announce(enabled ? 'Playback analytics enabled' : 'Playback analytics disabled');
});
orientationSelect.addEventListener('change', () => {
  player.orientationLockType = orientationSelect.value === 'none' ? null : orientationSelect.value;
  announce(orientationSelect.value === 'none' ? 'Fullscreen orientation lock disabled' : `Fullscreen will lock to ${orientationSelect.value}`);
});
const mediaWindow = document.querySelector('.media-window');
const artWindow = document.querySelector('#art-window');
const artSvg = document.querySelector('#art-svg');
const drawnArt = document.querySelector('#drawn-art');
const shapeSelectionLayer = document.querySelector('#shape-selection-layer');
const wallpaperImage = document.querySelector('#wallpaper-image');
const view = document.querySelector('#video-view');
const svg = document.querySelector('#frame-overlay');
const clipPath = document.querySelector('#clip-path');
const frameOutline = document.querySelector('#frame-outline');
const drawingPreview = document.querySelector('#drawing-preview');
const eraseMaskStrokes = document.querySelector('#erase-mask-strokes');
const eraseMask = document.querySelector('#video-erase-mask');
const eraseMaskRect = eraseMask.querySelector('rect');
const artEraseMaskStrokes = document.querySelector('#art-erase-mask-strokes');
const artEraseMask = document.querySelector('#art-erase-mask');
const artEraseMaskRect = artEraseMask.querySelector('rect');
const outlineEraseMask = document.querySelector('#outline-erase-mask');
const outlineEraseMaskRect = document.querySelector('#outline-erase-mask-rect');
const outlineEraseMaskStrokes = document.querySelector('#outline-erase-mask-strokes');
const eraserCursor = document.querySelector('#eraser-cursor');
const eraserSettings = document.querySelector('#eraser-settings');
const eraserSizeInput = document.querySelector('#eraser-size');
const eraserSizeValue = document.querySelector('#eraser-size-value');
const inkSettings = document.querySelector('#ink-settings');
const colorToolWrap = document.querySelector('.color-tool-wrap');
const colorPencilButton = document.querySelector('[data-tool="color-pencil"]');
const inkSwatches = [...document.querySelectorAll('.ink-swatch')];
const pencilSizeInput = document.querySelector('#pencil-size');
const pencilSizeValue = document.querySelector('#pencil-size-value');
const customInkInput = document.querySelector('#custom-ink');
const canvasPlayOverlay = document.querySelector('#canvas-play-overlay');
const helpHub = document.querySelector('#help-hub');
const helpTrigger = document.querySelector('#help-trigger');
const helpPanel = document.querySelector('#help-panel');
const shapeStampButtons = [...document.querySelectorAll('[data-shape]')];
const shapesToolWrap = document.querySelector('#shapes-tool-wrap');
const shapesTrigger = document.querySelector('#shapes-trigger');
const shapesPanel = document.querySelector('#shapes-panel');
const shapeColorInput = document.querySelector('#shape-custom-color');
const shapeOpacityInput = document.querySelector('#shape-opacity');
const shapeOpacityValue = document.querySelector('#shape-opacity-value');
const shapeColorSwatches = [...document.querySelectorAll('[data-shape-color]')];
const wallpaperToolWrap = document.querySelector('#wallpaper-tool-wrap');
const wallpaperTrigger = document.querySelector('#wallpaper-trigger');
const wallpaperPanel = document.querySelector('#wallpaper-panel');
const wallpaperLibrary = document.querySelector('.wallpaper-library');
const wallpaperUploadButton = document.querySelector('#upload-wallpaper');
const wallpaperUploadInput = document.querySelector('#wallpaper-upload-input');
const wallpaperFitInput = document.querySelector('#wallpaper-fit');
const wallpaperOpacityInput = document.querySelector('#wallpaper-opacity');
const wallpaperOpacityValue = document.querySelector('#wallpaper-opacity-value');
const clearWallpaperButton = document.querySelector('#clear-wallpaper');
let filmRadios = [...document.querySelectorAll('[data-film]')];
const videoPaletteWrap = document.querySelector('.video-palette-wrap');
const videoPaletteTrigger = document.querySelector('#video-palette-trigger');
const videoPalettePanel = document.querySelector('#video-palette-panel');
const stageSize = document.querySelector('#stage-size');
const label = document.querySelector('#active-film-label');
const loadState = document.querySelector('#load-state');
const frameNumber = document.querySelector('#frame-number');
const watercolorWipe = document.querySelector('#watercolor-wipe');
const drawingPrompt = document.querySelector('#drawing-prompt');

let activeShape = 'wide';
let activeFilm = 'joyride';
let drawing = false;
let colorDrawing = false;
let shapeDrawing = false;
let shapeDraft = null;
let shapeInteraction = null;
let selectedCanvasShape = null;
let currentShapeFill = '#e6b64c';
let currentShapeOpacity = Number(shapeOpacityInput.value) / 100;
let shapesPinned = false;
let wallpaperPinned = false;
let activeWallpaperId = '';
const canvasShapes = [];
const wallpaperObjectUrls = new Map();
const wallpaperUrlsToRevoke = [];
let artPath = null;
let activeInk = '#17181a';
let pencilSize = Number(pencilSizeInput.value);
let helpPinned = false;
let videoPalettePinned = false;
let points = [];
let sketchIndex = 1;
let autoplayAttempted = false;
let mediaRequested = false;
let mediaSourceLoaded = false;
let brushDrag = null;
let customFrame = null;
let erasing = false;
let priorErasePoint = null;
let eraserSize = Number(eraserSizeInput.value);
let frameClipBase = '';
let frameClipPoints = [];
let videoEraseStrokes = [];
let artEraseStrokes = [];
let activeEraseStroke = null;

function hideDrawingPrompt() {
  drawingPrompt.classList.add('is-dismissed');
  drawingPrompt.setAttribute('aria-hidden', 'true');
}

function syncPlayOverlay() {
  const empty = !view.classList.contains('has-frame');
  const visible = empty || !view.classList.contains('is-playing');
  canvasPlayOverlay.setAttribute('aria-hidden', String(!visible));
  canvasPlayOverlay.tabIndex = visible ? 0 : -1;
  canvasPlayOverlay.setAttribute('aria-label', empty ? 'Create a video frame and play' : 'Play video');
}

syncPlayOverlay();

function setHelpOpen(open) {
  helpHub.dataset.open = String(open);
  helpTrigger.setAttribute('aria-expanded', String(open));
  helpPanel.setAttribute('aria-hidden', String(!open));
}

function setInkSettingsOpen(open) {
  inkSettings.hidden = !open;
  inkSettings.setAttribute('aria-hidden', String(!open));
  colorPencilButton.setAttribute('aria-expanded', String(open));
}

function setVideoPaletteOpen(open) {
  videoPalettePanel.hidden = !open;
  videoPalettePanel.setAttribute('aria-hidden', String(!open));
  videoPaletteTrigger.setAttribute('aria-expanded', String(open));
}

function setPopoverOpen(trigger, panel, open) {
  panel.hidden = !open;
  panel.setAttribute('aria-hidden', String(!open));
  trigger.setAttribute('aria-expanded', String(open));
  if (open) positionToolPopover(trigger, panel);
}

function positionToolPopover(trigger, panel) {
  const triggerRect = trigger.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const margin = 12;
  const gap = 8;
  const horizontalDock = matchMedia('(max-height: 520px) and (max-width: 900px)').matches;
  let left;
  let top;

  if (horizontalDock) {
    left = Math.max(margin, Math.min(triggerRect.left, innerWidth - panelRect.width - margin));
    top = triggerRect.bottom + gap;
    if (top + panelRect.height > innerHeight - margin) top = triggerRect.top - panelRect.height - gap;
  } else {
    const rightLeft = triggerRect.right + gap;
    const leftLeft = triggerRect.left - panelRect.width - gap;
    left = rightLeft + panelRect.width <= innerWidth - margin
      ? rightLeft
      : Math.max(margin, leftLeft);
    top = Math.max(margin, Math.min(triggerRect.top, innerHeight - panelRect.height - margin));
  }

  panel.style.left = `${Math.max(margin, Math.min(left, innerWidth - panelRect.width - margin))}px`;
  panel.style.top = `${Math.max(margin, Math.min(top, innerHeight - panelRect.height - margin))}px`;
}

window.addEventListener('resize', () => {
  if (!shapesPanel.hidden) positionToolPopover(shapesTrigger, shapesPanel);
  if (!wallpaperPanel.hidden) positionToolPopover(wallpaperTrigger, wallpaperPanel);
});

helpTrigger.addEventListener('click', () => {
  helpPinned = !helpPinned;
  setHelpOpen(helpPinned);
});
helpHub.addEventListener('pointerenter', () => setHelpOpen(true));
helpHub.addEventListener('pointerleave', () => {
  if (!helpPinned && !helpHub.matches(':focus-within')) setHelpOpen(false);
});
helpHub.addEventListener('focusin', () => setHelpOpen(true));
helpHub.addEventListener('focusout', (event) => {
  if (!helpPinned && !helpHub.contains(event.relatedTarget)) setHelpOpen(false);
});
document.addEventListener('pointerdown', (event) => {
  if (!helpHub.contains(event.target)) {
    helpPinned = false;
    setHelpOpen(false);
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!wallpaperPanel.hidden) {
    wallpaperPinned = false;
    setPopoverOpen(wallpaperTrigger, wallpaperPanel, false);
    wallpaperTrigger.focus();
  } else if (!shapesPanel.hidden) {
    shapesPinned = false;
    setPopoverOpen(shapesTrigger, shapesPanel, false);
    shapesTrigger.focus();
  } else if (videoPalettePanel.getAttribute('aria-hidden') === 'false') {
    videoPalettePinned = false;
    setVideoPaletteOpen(false);
    videoPaletteTrigger.focus();
  } else if (helpPanel.getAttribute('aria-hidden') === 'false') {
    helpPinned = false;
    setHelpOpen(false);
    helpTrigger.focus();
  } else if (!inkSettings.hidden) {
    setInkSettingsOpen(false);
    colorPencilButton.focus();
  } else if (!eraserSettings.hidden) {
    eraserSettings.hidden = true;
    document.querySelector('[data-tool="eraser"]').focus();
  }
});

function roundedPolygonPath(points, close = true) {
  if (points.length < 2) return '';
  const list = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`);
  return `M${list.join(' L')}${close ? ' Z' : ''}`;
}

function viewBoxHeight() {
  const rect = view.getBoundingClientRect();
  return rect.width > 0 ? 1000 * rect.height / rect.width : 562.5;
}

function framePoints(shape, canvasHeight) {
  let width;
  let height;
  if (shape === 'square') {
    width = height = Math.min(900, canvasHeight * 0.84);
  } else if (shape === 'vintage') {
    height = Math.min(canvasHeight * 0.84, 900 * 3 / 4);
    width = height * 4 / 3;
  } else {
    width = Math.min(920, canvasHeight * 0.84 * 16 / 9);
    height = width * 9 / 16;
  }
  const left = (1000 - width) / 2;
  const top = (canvasHeight - height) / 2;
  const right = left + width;
  const bottom = top + height;
  const wobble = shape === 'square' ? 1.1 : 1.35;
  const raw = [
    [left, top + 1], [left + width * .24, top - 1], [left + width * .51, top + .6], [left + width * .77, top - .5], [right, top + 1.5],
    [right + .7, top + height * .32], [right - .6, top + height * .68], [right + .4, bottom - 1],
    [left + width * .74, bottom + 1], [left + width * .49, bottom - .7], [left + width * .23, bottom + 1], [left - .6, bottom - 1],
    [left + .8, top + height * .68], [left - .4, top + height * .34],
  ];
  return raw.map(([x, y], index) => [x + Math.sin(index * 2.13) * wobble, y + Math.cos(index * 1.73) * wobble]);
}

function startVideoInFrame() {
  view.classList.add('has-frame');
  hideDrawingPrompt();
  syncPlayOverlay();
}

function renderEraseMask(group, strokes, width, height) {
  group.replaceChildren(...strokes.map((stroke) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const strokePoints = stroke.points.map(([x, y]) => [x * width, y * height]);
    if (strokePoints.length === 1) strokePoints.push([strokePoints[0][0] + .01, strokePoints[0][1]]);
    path.setAttribute('d', `M${strokePoints.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')}`);
    path.setAttribute('stroke-width', String(stroke.size));
    return path;
  }));
}

function refreshClipPath() {
  clipPath.setAttribute('clip-rule', 'evenodd');
  clipPath.setAttribute('d', frameClipBase);
  const { width, height } = view.getBoundingClientRect();
  eraseMask.setAttribute('width', String(width));
  eraseMask.setAttribute('height', String(height));
  eraseMaskRect.setAttribute('width', String(width));
  eraseMaskRect.setAttribute('height', String(height));
  artEraseMask.setAttribute('width', String(width));
  artEraseMask.setAttribute('height', String(height));
  artEraseMaskRect.setAttribute('width', String(width));
  artEraseMaskRect.setAttribute('height', String(height));
  renderEraseMask(eraseMaskStrokes, videoEraseStrokes, width, height);
  renderEraseMask(artEraseMaskStrokes, artEraseStrokes, width, height);
  const canvasHeight = viewBoxHeight();
  svg.setAttribute('viewBox', `0 0 1000 ${canvasHeight}`);
  artSvg.setAttribute('viewBox', `0 0 1000 ${canvasHeight}`);
  outlineEraseMask.setAttribute('height', String(canvasHeight));
  outlineEraseMaskRect.setAttribute('height', String(canvasHeight));
  outlineEraseMaskStrokes.replaceChildren(...videoEraseStrokes.map((stroke) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const strokePoints = stroke.points.map(([x, y]) => [x * 1000, y * canvasHeight]);
    if (strokePoints.length === 1) strokePoints.push([strokePoints[0][0] + .01, strokePoints[0][1]]);
    path.setAttribute('d', `M${strokePoints.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')}`);
    path.setAttribute('stroke-width', String(stroke.size * 1000 / Math.max(1, width)));
    return path;
  }));
  if (!width || !height || !frameClipPoints.length) {
    mediaWindow.style.clipPath = '';
    mediaWindow.style.webkitClipPath = '';
    artWindow.style.clipPath = '';
    artWindow.style.webkitClipPath = '';
    return;
  }
  const cssPoints = frameClipPoints.map(([x, y]) => [x * width, y * height]);
  const outerPath = `M${cssPoints.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')} Z`;
  const cssPath = `path("${outerPath}")`;
  mediaWindow.style.clipPath = cssPath;
  mediaWindow.style.webkitClipPath = cssPath;
  const canvasPath = `M0 0 L${width.toFixed(2)} 0 L${width.toFixed(2)} ${height.toFixed(2)} L0 ${height.toFixed(2)} Z`;
  const outsidePlayerPath = `path(evenodd, "${canvasPath} ${outerPath}")`;
  artWindow.style.clipPath = outsidePlayerPath;
  artWindow.style.webkitClipPath = outsidePlayerPath;
}

function updateFrame(shape, customPoints = null, activate = true, preserveErasures = false) {
  const canvasHeight = viewBoxHeight();
  svg.setAttribute('viewBox', `0 0 1000 ${canvasHeight}`);
  svg.querySelector('.draw-hit-area').setAttribute('height', canvasHeight);
  const videoPathPoints = customPoints || framePoints(shape, canvasHeight);
  const d = roundedPolygonPath(videoPathPoints);
  const normalizedPoints = videoPathPoints.map(([x, y]) => [x / 1000, y / canvasHeight]);
  activeShape = shape;
  customFrame = customPoints ? customPoints.map(([x, y]) => [x / 1000, y / canvasHeight]) : null;
  frameClipPoints = normalizedPoints;
  frameClipBase = roundedPolygonPath(normalizedPoints);
  if (!preserveErasures) videoEraseStrokes = [];
  refreshClipPath();
  frameOutline.setAttribute('d', d);
  drawingPreview.setAttribute('d', '');
  const ratio = ratios[shape];
  stageSize.textContent = ratio ? `${ratio.label} ${ratio.direction.toLowerCase()} frame` : 'Hand-drawn video frame';
  shapeStampButtons.forEach((button) => {
    const selected = button.dataset.shape === shape;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  if (activate) startVideoInFrame();
}

function clearCanvas() {
  media.pause();
  try { media.currentTime = 0; } catch { /* The source may not have metadata yet. */ }
  mediaRequested = false;
  view.classList.remove('media-requested', 'media-error');
  loadState.classList.remove('is-visible');
  view.classList.remove('has-frame');
  view.classList.remove('is-playing');
  syncPlayOverlay();
  clipPath.setAttribute('d', '');
  frameClipBase = '';
  frameClipPoints = [];
  videoEraseStrokes = [];
  artEraseStrokes = [];
  activeEraseStroke = null;
  drawnArt.replaceChildren();
  canvasShapes.length = 0;
  selectedCanvasShape = null;
  shapeSelectionLayer.replaceChildren();
  clearWallpaper();
  refreshClipPath();
  frameOutline.setAttribute('d', '');
  drawingPreview.setAttribute('d', '');
  activeShape = 'wide';
  customFrame = null;
  sketchIndex = 1;
  frameNumber.textContent = '001';
  stageSize.textContent = 'Blank canvas';
  shapeStampButtons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });
  drawingPrompt.classList.remove('is-dismissed');
  drawingPrompt.removeAttribute('aria-hidden');
  loadState.classList.remove('is-visible');
  announce('Canvas cleared');
}

function setTool(tool) {
  const supported = ['pencil', 'eraser', 'color-pencil', 'shape-select', 'shape-fill', 'shape-rect', 'shape-ellipse', 'shape-triangle', 'shape-star'];
  const resolved = supported.includes(tool) ? tool : 'pencil';
  view.dataset.tool = resolved;
  document.querySelectorAll('[data-tool]').forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      const active = button.dataset.tool === resolved;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  });
  eraserSettings.hidden = resolved !== 'eraser';
  setInkSettingsOpen(resolved === 'color-pencil');
  renderCanvasShapeSelection();
  eraserCursor.classList.remove('is-visible');
}

function announce(message) {
  loadState.textContent = message;
  loadState.classList.add('is-visible');
  window.clearTimeout(announce.timeout);
  announce.timeout = window.setTimeout(() => loadState.classList.remove('is-visible'), 1800);
}

function applyFilmSource(film) {
  if (film.playbackId) {
    media.crossOrigin = 'anonymous';
    media.source = {
      playbackId: film.playbackId,
      playback: { maxResolution: '1080p' },
      poster: { time: 2, width: 1280 },
      storyboard: { format: 'webp' },
    };
  } else if (film.local) {
    media.removeAttribute('crossorigin');
    // Blob URLs have no file extension, so tell the media adapter the MIME type.
    media.source = { src: film.src, type: film.type || 'video/mp4' };
  } else {
    if (!film.src) {
      announce(`${film.name} is not available right now`);
      return false;
    }
    media.removeAttribute('crossorigin');
    media.source = { src: film.src, type: film.type || 'video/mp4' };
  }
  mediaSourceLoaded = true;
  return true;
}

function requestSelectedVideoPlayback() {
  const film = films[activeFilm];
  if (!film) return;
  const retryingFailedSource = view.classList.contains('media-error');
  mediaRequested = true;
  view.classList.add('media-requested');
  view.classList.remove('media-error');
  loadState.textContent = 'Loading video…';
  loadState.classList.add('is-visible');
  if (!mediaSourceLoaded && !applyFilmSource(film)) return;
  player.store.setMuted(false);
  if (retryingFailedSource) media.load();
  media.play().catch(() => {
    loadState.textContent = 'Press play to start the video';
    loadState.classList.add('is-visible');
  });
}

function setFilm(id, { focus = false } = {}) {
  const film = films[id];
  if (!film) return;
  if (uploadedCaptionTrack) {
    uploadedCaptionTrack.remove();
    uploadedCaptionTrack = null;
    URL.revokeObjectURL(uploadedCaptionUrl);
    uploadedCaptionUrl = '';
  }
  if (uploadedChapterTrack) {
    uploadedChapterTrack.remove();
    uploadedChapterTrack = null;
    URL.revokeObjectURL(uploadedChapterUrl);
    uploadedChapterUrl = '';
  }
  activeFilm = id;
  media.pause();
  mediaSourceLoaded = false;
  if (mediaRequested && !applyFilmSource(film)) return;
  label.textContent = `${film.name} video`;
  frameNumber.textContent = String(++sketchIndex).padStart(3, '0');
  filmRadios.forEach((radio) => {
    const selected = radio.dataset.film === id;
    radio.classList.toggle('is-selected', selected);
    radio.setAttribute('aria-checked', String(selected));
    radio.tabIndex = selected ? 0 : -1;
    if (selected && focus) radio.focus();
  });
  if (view.classList.contains('has-frame')) {
    if (mediaRequested) requestSelectedVideoPlayback();
    else announce(`${film.name} selected`);
  }
}

function stepFilm(direction) {
  if (!filmRadios.length) return;
  const currentIndex = filmRadios.findIndex((radio) => radio.dataset.film === activeFilm);
  const nextIndex = (currentIndex + direction + filmRadios.length) % filmRadios.length;
  setFilm(filmRadios[nextIndex].dataset.film);
}

document.querySelector('#previous-film').addEventListener('click', () => stepFilm(-1));
document.querySelector('#next-film').addEventListener('click', () => stepFilm(1));

document.addEventListener('pointermove', (event) => {
  if (!brushDrag) return;
  if (Math.hypot(event.clientX - brushDrag.x, event.clientY - brushDrag.y) > 12) brushDrag.moved = true;
});

document.addEventListener('pointerup', (event) => {
  if (!brushDrag) return;
  const drag = brushDrag;
  brushDrag = null;
  filmRadios.forEach((radio) => radio.classList.remove('is-brushing'));
  const target = document.elementFromPoint(event.clientX, event.clientY);
  if (!drag.moved || !target || !view.contains(target)) return;
  const film = films[drag.id];
  watercolorWipe.style.setProperty('--pigment', film.color);
  watercolorWipe.style.setProperty('--brush-x', `${event.clientX - view.getBoundingClientRect().left}px`);
  watercolorWipe.style.setProperty('--brush-y', `${event.clientY - view.getBoundingClientRect().top}px`);
  watercolorWipe.classList.remove('is-active');
  void watercolorWipe.offsetWidth;
  watercolorWipe.classList.add('is-active');
  setFilm(drag.id);
  window.setTimeout(() => watercolorWipe.classList.remove('is-active'), 760);
});

function eventPoint(event) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  return [
    Math.max(0, Math.min(1000, (event.clientX - rect.left) / rect.width * 1000)),
    Math.max(0, Math.min(viewBox.height, (event.clientY - rect.top) / rect.height * viewBox.height)),
  ];
}

function pointInVideoFrame([x, y]) {
  if (!view.classList.contains('has-frame') || frameClipPoints.length < 3) return false;
  let inside = false;
  for (let i = 0, j = frameClipPoints.length - 1; i < frameClipPoints.length; j = i++) {
    const [xi, yi] = frameClipPoints[i];
    const [xj, yj] = frameClipPoints[j];
    const crosses = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointCoveredByVideoEraser(x, y, width, height, strokes) {
  const px = x * width;
  const py = y * height;
  for (const { radius, path } of strokes) {
    if (path.length === 1 && Math.hypot(px - path[0][0], py - path[0][1]) <= radius) return true;
    for (let index = 1; index < path.length; index += 1) {
      const [startX, startY] = path[index - 1];
      const [endX, endY] = path[index];
      const dx = endX - startX;
      const dy = endY - startY;
      const lengthSquared = dx * dx + dy * dy || 1;
      const along = Math.max(0, Math.min(1, ((px - startX) * dx + (py - startY) * dy) / lengthSquared));
      if (Math.hypot(px - (startX + along * dx), py - (startY + along * dy)) <= radius) return true;
    }
  }
  return false;
}

function isVideoFrameFullyErased() {
  if (!view.classList.contains('has-frame') || !videoEraseStrokes.length || frameClipPoints.length < 3) return false;
  const xs = frameClipPoints.map(([x]) => x);
  const ys = frameClipPoints.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const { width, height } = view.getBoundingClientRect();
  const coverageStrokes = videoEraseStrokes.map((stroke) => ({
    radius: stroke.size / 2,
    path: stroke.points.map(([x, y]) => [x * width, y * height]),
  }));
  const columns = 72;
  const rows = 72;
  let samples = 0;
  let remainingSamples = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = minX + (column + .5) / columns * (maxX - minX);
      const y = minY + (row + .5) / rows * (maxY - minY);
      if (!pointInVideoFrame([x, y])) continue;
      samples += 1;
      if (!pointCoveredByVideoEraser(x, y, width, height, coverageStrokes)) remainingSamples += 1;
    }
  }
  return samples > 0 && remainingSamples / samples <= .012;
}

function drawPath() {
  return roundedPolygonPath(points, false);
}

function shapeBounds(shape) {
  const height = svg.viewBox.baseVal.height || viewBoxHeight();
  return { x: shape.x * 1000, y: shape.y * height, width: shape.width * 1000, height: shape.height * height };
}

function shapePath(type, { x, y, width, height }) {
  if (type === 'triangle') return `M${x + width / 2} ${y} L${x + width} ${y + height} L${x} ${y + height} Z`;
  if (type === 'star') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const points = Array.from({ length: 10 }, (_, index) => {
      const radius = index % 2 ? .22 : .48;
      const angle = -Math.PI / 2 + index * Math.PI / 5;
      return `${cx + Math.cos(angle) * width * radius} ${cy + Math.sin(angle) * height * radius}`;
    });
    return `M${points.join(' L')} Z`;
  }
  return '';
}

function renderCanvasShape(shape) {
  const bounds = shapeBounds(shape);
  const element = shape.element;
  if (shape.type === 'rect') {
    element.setAttribute('x', String(bounds.x));
    element.setAttribute('y', String(bounds.y));
    element.setAttribute('width', String(bounds.width));
    element.setAttribute('height', String(bounds.height));
    element.setAttribute('rx', String(Math.min(bounds.width, bounds.height) * .08));
  } else if (shape.type === 'ellipse') {
    element.setAttribute('cx', String(bounds.x + bounds.width / 2));
    element.setAttribute('cy', String(bounds.y + bounds.height / 2));
    element.setAttribute('rx', String(bounds.width / 2));
    element.setAttribute('ry', String(bounds.height / 2));
  } else {
    element.setAttribute('d', shapePath(shape.type, bounds));
  }
  element.setAttribute('fill', shape.fill);
  element.setAttribute('fill-opacity', String(shape.opacity));
  element.setAttribute('stroke', shape.stroke || '#252629');
  element.setAttribute('stroke-width', '2');
}

function renderCanvasShapeSelection() {
  shapeSelectionLayer.replaceChildren();
  if (!selectedCanvasShape || view.dataset.tool !== 'shape-select') return;
  const bounds = shapeBounds(selectedCanvasShape);
  const rect = svg.getBoundingClientRect();
  const vbHeight = svg.viewBox.baseVal.height || viewBoxBoxHeight();
  const pxX = 12 * 1000 / Math.max(rect.width, 1);
  const pxY = 12 * vbHeight / Math.max(rect.height, 1);
  const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  outline.setAttribute('class', 'shape-selection-box');
  outline.setAttribute('x', String(bounds.x));
  outline.setAttribute('y', String(bounds.y));
  outline.setAttribute('width', String(bounds.width));
  outline.setAttribute('height', String(bounds.height));
  shapeSelectionLayer.append(outline);
  const handles = [
    [bounds.x, bounds.y], [bounds.x + bounds.width, bounds.y],
    [bounds.x, bounds.y + bounds.height], [bounds.x + bounds.width, bounds.y + bounds.height],
  ];
  handles.forEach(([x, y]) => {
    const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    handle.setAttribute('class', 'shape-selection-handle');
    handle.setAttribute('x', String(x - pxX / 2));
    handle.setAttribute('y', String(y - pxY / 2));
    handle.setAttribute('width', String(pxX));
    handle.setAttribute('height', String(pxY));
    shapeSelectionLayer.append(handle);
  });
}

function findCanvasShapeAt(point) {
  for (let index = canvasShapes.length - 1; index >= 0; index -= 1) {
    const shape = canvasShapes[index];
    if (point[0] >= shape.x && point[0] <= shape.x + shape.width && point[1] >= shape.y && point[1] <= shape.y + shape.height) return shape;
  }
  return null;
}

function getResizeHandle(shape, point) {
  const bounds = shapeBounds(shape);
  const rect = svg.getBoundingClientRect();
  const thresholdX = 15 * 1000 / Math.max(rect.width, 1);
  const thresholdY = 15 * (svg.viewBox.baseVal.height || viewBoxHeight()) / Math.max(rect.height, 1);
  const corners = [
    [bounds.x, bounds.y], [bounds.x + bounds.width, bounds.y],
    [bounds.x, bounds.y + bounds.height], [bounds.x + bounds.width, bounds.y + bounds.height],
  ];
  return corners.findIndex(([x, y]) => Math.abs(point[0] - x) <= thresholdX && Math.abs(point[1] - y) <= thresholdY);
}

function updateShapeColor(color, { selected = false } = {}) {
  currentShapeFill = color;
  shapeColorInput.value = color;
  shapeColorSwatches.forEach((swatch) => {
    const active = swatch.dataset.shapeColor.toLowerCase() === color.toLowerCase();
    swatch.classList.toggle('is-selected', active);
    swatch.setAttribute('aria-checked', String(active));
    swatch.tabIndex = active ? 0 : -1;
  });
  if (selected && selectedCanvasShape) {
    selectedCanvasShape.fill = color;
    renderCanvasShape(selectedCanvasShape);
  }
}

function applyShapeEditAt(point, tool, pointerId) {
  if (pointInVideoFrame([point[0] / 1000, point[1] / (svg.viewBox.baseVal.height || viewBoxHeight())])) return false;
  const shape = findCanvasShapeAt([point[0] / 1000, point[1] / (svg.viewBox.baseVal.height || viewBoxHeight())]);
  if (tool === 'shape-fill') {
    if (shape) {
      shape.fill = currentShapeFill;
      shape.opacity = currentShapeOpacity;
      renderCanvasShape(shape);
      selectedCanvasShape = shape;
      announce('Shape filled');
    } else announce('Choose a shape to fill');
    return true;
  }
  selectedCanvasShape = shape;
  if (shape) {
    const handle = getResizeHandle(shape, point);
    const start = shapeBounds(shape);
    shapeInteraction = { shape, mode: handle < 0 ? 'move' : 'resize', handle, startPoint: point, startBounds: start };
    svg.setPointerCapture(pointerId);
  }
  renderCanvasShapeSelection();
  return Boolean(shape);
}

function viewBoxBoxHeight() {
  return svg.viewBox.baseVal.height || viewBoxHeight();
}

svg.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  eraserSettings.hidden = true;
  setInkSettingsOpen(false);
  const tool = view.dataset.tool;
  const point = eventPoint(event);
  if (tool === 'shape-fill' || tool === 'shape-select') {
    applyShapeEditAt(point, tool, event.pointerId);
    event.preventDefault();
    return;
  }
  if (tool.startsWith('shape-')) {
    const normalizedPoint = [point[0] / 1000, point[1] / (svg.viewBox.baseVal.height || viewBoxHeight())];
    if (pointInVideoFrame(normalizedPoint)) return;
    hideDrawingPrompt();
    const shapeType = tool.slice('shape-'.length);
    const elementTag = ['rect', 'ellipse'].includes(shapeType) ? shapeType : 'path';
    const element = document.createElementNS('http://www.w3.org/2000/svg', elementTag);
    element.classList.add('canvas-shape');
    element.style.pointerEvents = 'none';
    shapeDraft = {
      type: shapeType,
      x: normalizedPoint[0], y: normalizedPoint[1], width: .001, height: .001,
      fill: currentShapeFill, opacity: currentShapeOpacity, stroke: '#252629', element,
    };
    canvasShapes.push(shapeDraft);
    drawnArt.append(element);
    shapeDrawing = true;
    selectedCanvasShape = shapeDraft;
    renderCanvasShape(shapeDraft);
    svg.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  if (view.dataset.tool === 'eraser') {
    erasing = true;
    priorErasePoint = eventPoint(event);
    activeEraseStroke = { size: eraserSize, points: [] };
    if (frameClipBase) videoEraseStrokes.push(activeEraseStroke);
    artEraseStrokes.push(activeEraseStroke);
    svg.setPointerCapture(event.pointerId);
    eraseBetween(priorErasePoint, priorErasePoint);
    event.preventDefault();
    return;
  }
  if (view.dataset.tool === 'color-pencil') {
    if (pointInVideoFrame([point[0] / 1000, point[1] / svg.viewBox.baseVal.height])) return;
    hideDrawingPrompt();
    colorDrawing = true;
    points = [point];
    artPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    artPath.classList.add('art-stroke');
    artPath.setAttribute('stroke', activeInk);
    artPath.setAttribute('stroke-width', String(pencilSize));
    drawnArt.append(artPath);
    svg.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  hideDrawingPrompt();
  drawing = true;
  points = [eventPoint(event)];
  svg.setPointerCapture(event.pointerId);
  drawingPreview.setAttribute('d', drawPath());
  event.preventDefault();
});

svg.addEventListener('pointermove', (event) => {
  if (view.dataset.tool === 'eraser') {
    const rect = view.getBoundingClientRect();
    eraserCursor.style.left = `${event.clientX - rect.left}px`;
    eraserCursor.style.top = `${event.clientY - rect.top}px`;
    eraserCursor.style.width = `${eraserSize}px`;
    eraserCursor.style.height = `${eraserSize}px`;
    eraserCursor.classList.add('is-visible');
    if (erasing) {
      const next = eventPoint(event);
      eraseBetween(priorErasePoint, next);
      priorErasePoint = next;
    }
  }
  if (shapeDrawing && shapeDraft) {
    const point = eventPoint(event);
    const height = svg.viewBox.baseVal.height || viewBoxHeight();
    const start = shapeDraft.start || [shapeDraft.x * 1000, shapeDraft.y * height];
    shapeDraft.start = start;
    shapeDraft.x = Math.min(start[0], point[0]) / 1000;
    shapeDraft.y = Math.min(start[1], point[1]) / height;
    shapeDraft.width = Math.max(16, Math.abs(point[0] - start[0])) / 1000;
    shapeDraft.height = Math.max(16, Math.abs(point[1] - start[1])) / height;
    renderCanvasShape(shapeDraft);
    renderCanvasShapeSelection();
    return;
  }
  if (shapeInteraction) {
    const point = eventPoint(event);
    const height = svg.viewBox.baseVal.height || viewBoxHeight();
    const start = shapeInteraction.startPoint;
    const bounds = shapeInteraction.startBounds;
    const shape = shapeInteraction.shape;
    if (shapeInteraction.mode === 'move') {
      const x = Math.max(0, Math.min(1000 - bounds.width, bounds.x + point[0] - start[0]));
      const y = Math.max(0, Math.min(height - bounds.height, bounds.y + point[1] - start[1]));
      shape.x = x / 1000;
      shape.y = y / height;
    } else {
      const rightHandle = shapeInteraction.handle === 1 || shapeInteraction.handle === 3;
      const bottomHandle = shapeInteraction.handle >= 2;
      let left = bounds.x;
      let top = bounds.y;
      let right = bounds.x + bounds.width;
      let bottom = bounds.y + bounds.height;
      if (rightHandle) right = Math.max(left + 16, Math.min(1000, point[0]));
      else left = Math.max(0, Math.min(right - 16, point[0]));
      if (bottomHandle) bottom = Math.max(top + 16, Math.min(height, point[1]));
      else top = Math.max(0, Math.min(bottom - 16, point[1]));
      shape.x = left / 1000;
      shape.y = top / height;
      shape.width = (right - left) / 1000;
      shape.height = (bottom - top) / height;
    }
    renderCanvasShape(shape);
    renderCanvasShapeSelection();
    return;
  }
  if (colorDrawing) {
    const next = eventPoint(event);
    const prior = points.at(-1);
    if (Math.hypot(next[0] - prior[0], next[1] - prior[1]) > 2) points.push(next);
    artPath.setAttribute('d', drawPath());
    return;
  }
  if (!drawing) return;
  const next = eventPoint(event);
  const prior = points.at(-1);
  if (Math.hypot(next[0] - prior[0], next[1] - prior[1]) > 3.4) points.push(next);
  drawingPreview.setAttribute('d', drawPath());
});

function eraseBetween(from, to) {
  if (!activeEraseStroke) return;
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  const dx = (to[0] - from[0]) * rect.width / 1000;
  const dy = (to[1] - from[1]) * rect.height / viewBox.height;
  const distance = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(distance / Math.max(3, eraserSize * .35)));
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const x = from[0] + (to[0] - from[0]) * progress;
    const y = from[1] + (to[1] - from[1]) * progress;
    const point = [x / 1000, y / viewBox.height];
    const prior = activeEraseStroke.points.at(-1);
    if (!prior || Math.hypot((point[0] - prior[0]) * rect.width, (point[1] - prior[1]) * rect.height) > 0.5) {
      activeEraseStroke.points.push(point);
    }
  }
  refreshClipPath();
}

function finishDrawing() {
  if (shapeDrawing && shapeDraft) {
    shapeDrawing = false;
    const shape = shapeDraft;
    shapeDraft = null;
    if (shape.width < .02 || shape.height < .025) {
      shape.element.remove();
      canvasShapes.splice(canvasShapes.indexOf(shape), 1);
      selectedCanvasShape = null;
      renderCanvasShapeSelection();
      announce('Drag farther to make a shape');
    } else {
      setTool('shape-select');
      announce(`${shape.type} added`);
    }
    return;
  }
  if (shapeInteraction) {
    shapeInteraction = null;
    return;
  }
  if (erasing) {
    erasing = false;
    priorErasePoint = null;
    activeEraseStroke = null;
    if (isVideoFrameFullyErased()) clearCanvas();
    return;
  }
  if (colorDrawing) {
    colorDrawing = false;
    if (points.length === 1) points.push([points[0][0] + .1, points[0][1]]);
    artPath?.setAttribute('d', drawPath());
    artPath = null;
    points = [];
    return;
  }
  if (!drawing) return;
  drawing = false;
  drawingPreview.setAttribute('d', '');
  if (points.length >= 5) {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    if (area > 14000) {
      updateFrame('custom', points);
      frameNumber.textContent = String(++sketchIndex).padStart(3, '0');
      announce('Hand-drawn frame applied');
    } else {
      announce('Draw a wider outline to shape the frame');
    }
  }
  points = [];
}

svg.addEventListener('pointerup', (event) => {
  if (shapeDrawing) {
    const point = eventPoint(event);
    const height = svg.viewBox.baseVal.height || viewBoxHeight();
    if (shapeDraft) {
      const start = shapeDraft.start || [shapeDraft.x * 1000, shapeDraft.y * height];
      shapeDraft.x = Math.min(start[0], point[0]) / 1000;
      shapeDraft.y = Math.min(start[1], point[1]) / height;
      shapeDraft.width = Math.max(16, Math.abs(point[0] - start[0])) / 1000;
      shapeDraft.height = Math.max(16, Math.abs(point[1] - start[1])) / height;
      renderCanvasShape(shapeDraft);
    }
    finishDrawing();
    return;
  }
  if (shapeInteraction) {
    finishDrawing();
    return;
  }
  const endpoint = eventPoint(event);
  if (erasing && priorErasePoint) {
    eraseBetween(priorErasePoint, endpoint);
    priorErasePoint = endpoint;
  } else if ((drawing || colorDrawing) && points.length) {
    const prior = points.at(-1);
    if (Math.hypot(endpoint[0] - prior[0], endpoint[1] - prior[1]) > 0.5) points.push(endpoint);
    if (drawing) drawingPreview.setAttribute('d', drawPath());
    if (colorDrawing) artPath?.setAttribute('d', drawPath());
  }
  finishDrawing();
});
svg.addEventListener('pointercancel', finishDrawing);
svg.addEventListener('pointerleave', () => eraserCursor.classList.remove('is-visible'));
svg.addEventListener('pointerenter', (event) => {
  if (view.dataset.tool !== 'eraser') return;
  const rect = view.getBoundingClientRect();
  eraserCursor.style.left = `${event.clientX - rect.left}px`;
  eraserCursor.style.top = `${event.clientY - rect.top}px`;
  eraserCursor.style.width = `${eraserSize}px`;
  eraserCursor.style.height = `${eraserSize}px`;
  eraserCursor.classList.add('is-visible');
});

eraserSizeInput.addEventListener('input', () => {
  eraserSize = Number(eraserSizeInput.value);
  eraserSizeValue.value = `${eraserSize} px`;
  eraserCursor.style.width = `${eraserSize}px`;
  eraserCursor.style.height = `${eraserSize}px`;
});

inkSwatches.forEach((swatch, index) => {
  swatch.addEventListener('click', () => {
    activeInk = swatch.dataset.ink;
    customInkInput.value = activeInk;
    inkSwatches.forEach((candidate) => {
      const selected = candidate === swatch;
      candidate.classList.toggle('is-selected', selected);
      candidate.setAttribute('aria-checked', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });
  });
  swatch.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? inkSwatches.length - 1 :
      (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + inkSwatches.length) % inkSwatches.length;
    inkSwatches[next].click();
    inkSwatches[next].focus();
  });
});

colorToolWrap.addEventListener('pointerenter', () => setInkSettingsOpen(true));
colorToolWrap.addEventListener('pointerleave', () => {
  if (view.dataset.tool !== 'color-pencil' && !colorToolWrap.matches(':focus-within')) setInkSettingsOpen(false);
});
colorToolWrap.addEventListener('focusin', () => setInkSettingsOpen(true));
colorToolWrap.addEventListener('focusout', (event) => {
  if (view.dataset.tool !== 'color-pencil' && !colorToolWrap.contains(event.relatedTarget)) setInkSettingsOpen(false);
});
colorPencilButton.addEventListener('click', () => setInkSettingsOpen(true));

pencilSizeInput.addEventListener('input', () => {
  pencilSize = Number(pencilSizeInput.value);
  pencilSizeValue.value = `${pencilSize} px`;
});

customInkInput.addEventListener('input', () => {
  activeInk = customInkInput.value;
  inkSwatches.forEach((candidate) => {
    candidate.classList.remove('is-selected');
    candidate.setAttribute('aria-checked', 'false');
    candidate.tabIndex = -1;
  });
});

const uploadButton = document.querySelector('#upload-video');
const videoUpload = document.querySelector('#video-upload');
const filmTools = document.querySelector('.film-tools');
const uploadedVideoUrls = [];
const localVideoDbName = 'forma-local-video-library';
const localVideoStoreName = 'videos';
const localWallpaperStoreName = 'wallpapers';
let uploadedCaptionUrl = '';
let uploadedCaptionTrack = null;
let uploadedChapterUrl = '';
let uploadedChapterTrack = null;
const uploadedFilmColors = ['#9b4f73', '#b46b36', '#327f82', '#806b34', '#67589d', '#4f7352'];
let uploadedColorIndex = 0;

function openLocalVideoDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(localVideoDbName, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(localVideoStoreName)) database.createObjectStore(localVideoStoreName, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(localWallpaperStoreName)) database.createObjectStore(localWallpaperStoreName, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open browser video storage.'));
  });
}

async function saveLocalVideo(file) {
  const db = await openLocalVideoDb();
  const record = {
    id: `upload-${crypto.randomUUID()}`,
    name: file.name.replace(/\.[^.]+$/, ''),
    type: file.type || 'video/mp4',
    blob: file,
    addedAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(localVideoStoreName, 'readwrite');
    transaction.objectStore(localVideoStoreName).put(record);
    transaction.oncomplete = () => { db.close(); resolve(record); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error('Could not save this video in browser storage.')); };
    transaction.onabort = () => { db.close(); reject(transaction.error || new Error('Video storage ran out of space.')); };
  });
}

async function loadSavedVideos() {
  const db = await openLocalVideoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(localVideoStoreName, 'readonly');
    const request = transaction.objectStore(localVideoStoreName).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => a.addedAt - b.addedAt));
    request.onerror = () => reject(request.error || new Error('Could not read saved browser videos.'));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error('Could not read saved browser videos.')); };
  });
}

async function saveLocalWallpaper(file) {
  const db = await openLocalVideoDb();
  const record = { id: `wallpaper-${crypto.randomUUID()}`, name: file.name.replace(/\.[^.]+$/, ''), blob: file, addedAt: Date.now() };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(localWallpaperStoreName, 'readwrite');
    transaction.objectStore(localWallpaperStoreName).put(record);
    transaction.oncomplete = () => { db.close(); resolve(record); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error('Could not save this background in browser storage.')); };
    transaction.onabort = () => { db.close(); reject(transaction.error || new Error('Background image storage ran out of space.')); };
  });
}

async function loadSavedWallpapers() {
  const db = await openLocalVideoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(localWallpaperStoreName, 'readonly');
    const request = transaction.objectStore(localWallpaperStoreName).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => a.addedAt - b.addedAt));
    request.onerror = () => reject(request.error || new Error('Could not read saved background images.'));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error('Could not read saved background images.')); };
  });
}

function setWallpaper(id, name, src, { persist = true, announceChange = true } = {}) {
  activeWallpaperId = id;
  wallpaperImage.src = src;
  wallpaperImage.alt = '';
  view.classList.add('has-wallpaper');
  wallpaperLibrary.querySelectorAll('[data-wallpaper]').forEach((button) => {
    const selected = button.dataset.wallpaper === id;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-checked', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  hideDrawingPrompt();
  if (persist) {
    try { localStorage.setItem('forma:active-wallpaper', id); } catch { /* The selected image still applies until reload. */ }
  }
  if (announceChange) announce(`${name} background applied`);
}

function clearWallpaper({ persist = true } = {}) {
  activeWallpaperId = '';
  wallpaperImage.removeAttribute('src');
  view.classList.remove('has-wallpaper');
  wallpaperLibrary.querySelectorAll('[data-wallpaper]').forEach((button) => {
    button.classList.remove('is-selected');
    button.setAttribute('aria-checked', 'false');
    button.tabIndex = -1;
  });
  wallpaperFitInput.value = 'cover';
  wallpaperOpacityInput.value = '100';
  wallpaperOpacityValue.value = '100%';
  view.style.setProperty('--wallpaper-opacity', '1');
  wallpaperImage.style.objectFit = 'cover';
  if (persist) {
    try { localStorage.removeItem('forma:active-wallpaper'); } catch { /* Ignore unavailable browser storage. */ }
  }
}

function addWallpaperToLibrary(record, { select = false } = {}) {
  const src = URL.createObjectURL(record.blob);
  wallpaperObjectUrls.set(record.id, src);
  wallpaperUrlsToRevoke.push(src);
  const button = document.createElement('button');
  button.className = 'wallpaper-swatch';
  button.type = 'button';
  button.setAttribute('role', 'radio');
  button.setAttribute('aria-checked', 'false');
  button.tabIndex = -1;
  button.dataset.wallpaper = record.id;
  button.dataset.wallpaperName = record.name;
  button.setAttribute('aria-label', `${record.name}, uploaded background`);
  const thumbnail = document.createElement('img');
  thumbnail.src = src;
  thumbnail.alt = '';
  const title = document.createElement('span');
  title.textContent = record.name;
  button.append(thumbnail, title);
  button.addEventListener('click', () => setWallpaper(record.id, record.name, src));
  wallpaperLibrary.append(button);
  if (select) setWallpaper(record.id, record.name, src);
}

async function restoreLocalWallpapers() {
  try {
    const records = await loadSavedWallpapers();
    records.forEach((record) => addWallpaperToLibrary(record));
    let savedId = '';
    try { savedId = localStorage.getItem('forma:active-wallpaper') || ''; } catch { /* No saved selection. */ }
    const builtIn = [...wallpaperLibrary.querySelectorAll('[data-wallpaper]')].find((button) => button.dataset.wallpaper === savedId);
    const uploaded = records.find((record) => record.id === savedId);
    if (builtIn) setWallpaper(savedId, builtIn.dataset.wallpaperName, builtIn.dataset.wallpaper, { persist: false, announceChange: false });
    else if (uploaded) setWallpaper(savedId, uploaded.name, wallpaperObjectUrls.get(savedId), { persist: false, announceChange: false });
  } catch {
    announce('Background image storage is unavailable; built-in wallpapers still work.');
  }
}

function addLocalVideoToPalette(record) {
  const id = record.id;
  const color = uploadedFilmColors[uploadedColorIndex++ % uploadedFilmColors.length];
  const src = URL.createObjectURL(record.blob);
  uploadedVideoUrls.push(src);
  films[id] = { name: record.name, label: record.name, color, shape: 'wide', src, type: record.type, local: true };
  const radio = document.createElement('button');
  radio.className = 'film-swatch';
  radio.type = 'button';
  radio.setAttribute('role', 'radio');
  radio.setAttribute('aria-checked', 'false');
  radio.tabIndex = -1;
  radio.dataset.film = id;
  radio.setAttribute('aria-label', `${record.name} video, saved in this browser`);
  radio.title = `${record.name} · this browser`;
  const swatch = document.createElement('span');
  swatch.className = 'swatch-color';
  swatch.style.setProperty('--film-color', color);
  swatch.setAttribute('aria-hidden', 'true');
  radio.append(swatch);
  filmTools.append(radio);
  bindFilmRadio(radio);
  filmRadios = [...filmTools.querySelectorAll('[data-film]')];
}

async function restoreLocalVideos() {
  try {
    const records = await loadSavedVideos();
    records.forEach(addLocalVideoToPalette);
  } catch {
    announce('Browser video storage is unavailable. New uploads will not be saved after closing this page.');
  }
}

function bindFilmRadio(radio) {
  radio.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    brushDrag = { id: radio.dataset.film, x: event.clientX, y: event.clientY, moved: false };
    radio.classList.add('is-brushing');
  });
  radio.addEventListener('pointerup', () => radio.classList.remove('is-brushing'));
  radio.addEventListener('click', () => setFilm(radio.dataset.film));
  radio.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = filmRadios.indexOf(radio);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? filmRadios.length - 1 :
      (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + filmRadios.length) % filmRadios.length;
    setFilm(filmRadios[nextIndex].dataset.film, { focus: true });
  });
}

filmRadios.forEach(bindFilmRadio);
function bindPopover(trigger, panel, wrap, isPinned, setPinned) {
  trigger.addEventListener('click', () => {
    setPinned(!isPinned());
    setPopoverOpen(trigger, panel, isPinned());
  });
  wrap.addEventListener('pointerenter', () => setPopoverOpen(trigger, panel, true));
  wrap.addEventListener('pointerleave', () => {
    if (!isPinned() && !wrap.matches(':focus-within')) setPopoverOpen(trigger, panel, false);
  });
  wrap.addEventListener('focusin', () => setPopoverOpen(trigger, panel, true));
  wrap.addEventListener('focusout', (event) => {
    if (!isPinned() && !wrap.contains(event.relatedTarget)) setPopoverOpen(trigger, panel, false);
  });
}
bindPopover(shapesTrigger, shapesPanel, shapesToolWrap, () => shapesPinned, (value) => { shapesPinned = value; });
bindPopover(wallpaperTrigger, wallpaperPanel, wallpaperToolWrap, () => wallpaperPinned, (value) => { wallpaperPinned = value; });

shapeColorSwatches.forEach((swatch) => swatch.addEventListener('click', () => updateShapeColor(swatch.dataset.shapeColor)));
shapeColorInput.addEventListener('input', () => updateShapeColor(shapeColorInput.value));
shapeOpacityInput.addEventListener('input', () => {
  currentShapeOpacity = Number(shapeOpacityInput.value) / 100;
  shapeOpacityValue.value = `${shapeOpacityInput.value}%`;
  if (selectedCanvasShape) {
    selectedCanvasShape.opacity = currentShapeOpacity;
    renderCanvasShape(selectedCanvasShape);
  }
});
shapeColorSwatches.forEach((swatch) => swatch.addEventListener('keydown', (event) => {
  if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const index = shapeColorSwatches.indexOf(swatch);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? shapeColorSwatches.length - 1 :
    (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + shapeColorSwatches.length) % shapeColorSwatches.length;
  shapeColorSwatches[next].focus();
  shapeColorSwatches[next].click();
}));

wallpaperLibrary.querySelectorAll('[data-wallpaper]').forEach((button) => button.addEventListener('click', () => {
  setWallpaper(button.dataset.wallpaper, button.dataset.wallpaperName, button.dataset.wallpaper);
}));
wallpaperLibrary.addEventListener('keydown', (event) => {
  const radio = event.target.closest('[data-wallpaper]');
  if (!radio || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  const wallpapers = [...wallpaperLibrary.querySelectorAll('[data-wallpaper]')];
  const index = wallpapers.indexOf(radio);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? wallpapers.length - 1 :
    (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + wallpapers.length) % wallpapers.length;
  event.preventDefault();
  wallpapers[next].focus();
  wallpapers[next].click();
});
wallpaperUploadButton.addEventListener('click', () => {
  wallpaperPinned = true;
  setPopoverOpen(wallpaperTrigger, wallpaperPanel, true);
  wallpaperUploadInput.click();
});
wallpaperUploadInput.addEventListener('change', async () => {
  const images = [...wallpaperUploadInput.files].filter((file) => file.type.startsWith('image/'));
  let latest = null;
  for (const image of images) {
    try {
      const record = await saveLocalWallpaper(image);
      addWallpaperToLibrary(record);
      latest = record;
    } catch {
      const fallback = { id: `session-${crypto.randomUUID()}`, name: image.name.replace(/\.[^.]+$/, ''), blob: image, addedAt: Date.now() };
      addWallpaperToLibrary(fallback);
      latest = fallback;
      announce(`Could not save ${image.name}; it will be available for this session.`);
    }
  }
  if (latest) {
    setWallpaper(latest.id, latest.name, wallpaperObjectUrls.get(latest.id));
    announce(`${latest.name} added as a background`);
  }
  wallpaperUploadInput.value = '';
});
wallpaperFitInput.addEventListener('change', () => {
  wallpaperImage.style.objectFit = wallpaperFitInput.value;
});
wallpaperOpacityInput.addEventListener('input', () => {
  const opacity = Number(wallpaperOpacityInput.value) / 100;
  wallpaperOpacityValue.value = `${wallpaperOpacityInput.value}%`;
  view.style.setProperty('--wallpaper-opacity', String(opacity));
});
clearWallpaperButton.addEventListener('click', () => {
  clearWallpaper();
  announce('Background removed');
});

videoPaletteTrigger.addEventListener('click', () => {
  videoPalettePinned = !videoPalettePinned;
  setVideoPaletteOpen(videoPalettePinned);
});
videoPaletteWrap.addEventListener('pointerenter', () => setVideoPaletteOpen(true));
videoPaletteWrap.addEventListener('pointerleave', () => {
  if (!videoPalettePinned && !videoPaletteWrap.matches(':focus-within')) setVideoPaletteOpen(false);
});
videoPaletteWrap.addEventListener('focusin', () => setVideoPaletteOpen(true));
videoPaletteWrap.addEventListener('focusout', (event) => {
  if (!videoPalettePinned && !videoPaletteWrap.contains(event.relatedTarget)) setVideoPaletteOpen(false);
});
uploadButton.addEventListener('click', () => {
  videoPalettePinned = true;
  setVideoPaletteOpen(true);
  videoUpload.click();
});
const uploadCaptionsButton = document.querySelector('#upload-captions');
const captionUpload = document.querySelector('#caption-upload');
const uploadChaptersButton = document.querySelector('#upload-chapters');
const chapterUpload = document.querySelector('#chapter-upload');
uploadCaptionsButton.addEventListener('click', () => captionUpload.click());
captionUpload.addEventListener('change', () => {
  const file = captionUpload.files?.[0];
  if (!file) return;
  if (uploadedCaptionTrack) uploadedCaptionTrack.remove();
  if (uploadedCaptionUrl) URL.revokeObjectURL(uploadedCaptionUrl);
  uploadedCaptionUrl = URL.createObjectURL(file);
  uploadedCaptionTrack = document.createElement('track');
  uploadedCaptionTrack.kind = 'captions';
  uploadedCaptionTrack.label = file.name.replace(/\.vtt$/i, '') || 'Captions';
  uploadedCaptionTrack.srclang = 'en';
  uploadedCaptionTrack.src = uploadedCaptionUrl;
  uploadedCaptionTrack.default = true;
  media.append(uploadedCaptionTrack);
  announce(`Captions loaded: ${uploadedCaptionTrack.label}`);
  captionUpload.value = '';
});
uploadChaptersButton.addEventListener('click', () => chapterUpload.click());
chapterUpload.addEventListener('change', () => {
  const file = chapterUpload.files?.[0];
  if (!file) return;
  if (uploadedChapterTrack) uploadedChapterTrack.remove();
  if (uploadedChapterUrl) URL.revokeObjectURL(uploadedChapterUrl);
  uploadedChapterUrl = URL.createObjectURL(file);
  uploadedChapterTrack = document.createElement('track');
  uploadedChapterTrack.kind = 'chapters';
  uploadedChapterTrack.label = file.name.replace(/\.vtt$/i, '') || 'Chapters';
  uploadedChapterTrack.srclang = 'en';
  uploadedChapterTrack.src = uploadedChapterUrl;
  uploadedChapterTrack.default = true;
  media.append(uploadedChapterTrack);
  announce(`Chapter markers loaded: ${uploadedChapterTrack.label}`);
  chapterUpload.value = '';
});
videoUpload.addEventListener('change', async () => {
  const files = [...videoUpload.files].filter((file) => file.type.startsWith('video/'));
  const addedIds = [];
  for (const file of files) {
    try {
      const record = await saveLocalVideo(file);
      addLocalVideoToPalette(record);
      addedIds.push(record.id);
    } catch {
      announce(`Could not save ${file.name}. Check available browser storage and try again.`);
    }
  }
  const addedRadio = filmRadios.at(-1);
  if (addedIds.length && addedRadio) {
    setFilm(addedRadio.dataset.film, { focus: true });
    setTool('pencil');
    announce(`${addedIds.length} video${addedIds.length === 1 ? '' : 's'} saved in this browser`);
  }
  videoUpload.value = '';
});
window.addEventListener('pagehide', () => {
  uploadedVideoUrls.forEach((url) => URL.revokeObjectURL(url));
  wallpaperUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
  if (uploadedCaptionUrl) URL.revokeObjectURL(uploadedCaptionUrl);
  if (uploadedChapterUrl) URL.revokeObjectURL(uploadedChapterUrl);
}, { once: true });

document.querySelectorAll('.icon-tool[data-tool], .mini-tool[data-tool]').forEach((button) => button.addEventListener('click', () => setTool(button.dataset.tool)));
document.addEventListener('pointerdown', (event) => {
  if (!eraserSettings.contains(event.target) && !event.target.closest('[data-tool="eraser"]')) eraserSettings.hidden = true;
  if (!colorToolWrap.contains(event.target)) setInkSettingsOpen(false);
  if (!videoPaletteWrap.contains(event.target)) {
    videoPalettePinned = false;
    setVideoPaletteOpen(false);
  }
  if (!shapesToolWrap.contains(event.target)) {
    shapesPinned = false;
    setPopoverOpen(shapesTrigger, shapesPanel, false);
  }
  if (!wallpaperToolWrap.contains(event.target)) {
    wallpaperPinned = false;
    setPopoverOpen(wallpaperTrigger, wallpaperPanel, false);
  }
});
document.addEventListener('click', (event) => {
  if (!eraserSettings.contains(event.target) && !event.target.closest('[data-tool="eraser"]')) eraserSettings.hidden = true;
  if (!colorToolWrap.contains(event.target)) setInkSettingsOpen(false);
  if (!videoPaletteWrap.contains(event.target)) {
    videoPalettePinned = false;
    setVideoPaletteOpen(false);
  }
  if (!shapesToolWrap.contains(event.target)) {
    shapesPinned = false;
    setPopoverOpen(shapesTrigger, shapesPanel, false);
  }
  if (!wallpaperToolWrap.contains(event.target)) {
    wallpaperPinned = false;
    setPopoverOpen(wallpaperTrigger, wallpaperPanel, false);
  }
});
shapeStampButtons.forEach((button) => button.addEventListener('click', () => {
  setTool('pencil');
  updateFrame(button.dataset.shape);
  frameNumber.textContent = String(++sketchIndex).padStart(3, '0');
}));

document.querySelector('#reset-frame').addEventListener('click', () => {
  clearCanvas();
  setTool('pencil');
});

document.querySelector('.play-control').addEventListener('click', (event) => {
  if (view.classList.contains('has-frame')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  updateFrame('wide');
}, true);

canvasPlayOverlay.addEventListener('click', () => {
  if (!view.classList.contains('has-frame')) {
    updateFrame('wide');
  }
  requestSelectedVideoPlayback();
});

media.addEventListener('loadeddata', () => {
  view.classList.remove('media-error');
  loadState.classList.remove('is-visible');
  autoplayAttempted = true;
});
media.addEventListener('error', () => {
  if (!mediaRequested) return;
  view.classList.add('media-error');
  loadState.textContent = 'Video could not load. Check your connection and press Play to retry.';
  loadState.classList.add('is-visible');
});
media.addEventListener('playing', () => {
  loadState.classList.remove('is-visible');
  view.classList.add('is-playing');
  syncPlayOverlay();
});
media.addEventListener('pause', () => {
  view.classList.remove('is-playing');
  syncPlayOverlay();
  if (!autoplayAttempted && media.readyState >= 2) loadState.classList.remove('is-visible');
});

player.addEventListener('fullscreenchange', () => {
  view.classList.toggle('is-fullscreen', Boolean(media.isFullscreen));
});

const resizeObserver = new ResizeObserver(() => {
  if (!view.classList.contains('has-frame')) {
    const height = viewBoxHeight();
    svg.setAttribute('viewBox', `0 0 1000 ${height}`);
    svg.querySelector('.draw-hit-area').setAttribute('height', height);
    refreshClipPath();
    canvasShapes.forEach(renderCanvasShape);
    renderCanvasShapeSelection();
    return;
  }
  if (customFrame) {
    const height = viewBoxHeight();
    updateFrame('custom', customFrame.map(([x, y]) => [x * 1000, y * height]), false, true);
  } else {
    updateFrame(activeShape, null, false, true);
  }
  canvasShapes.forEach(renderCanvasShape);
  renderCanvasShapeSelection();
});
resizeObserver.observe(view);

setFilm(activeFilm);
updateFrame('wide', null, false);
startVideoInFrame();
void restoreLocalVideos();
void restoreLocalWallpapers();
