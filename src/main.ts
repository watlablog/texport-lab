import './style.css';
import { createPngBlob, downloadPng, downloadSvg } from './exportImage';
import { greekLetters, type GreekLetter } from './greekLetters';
import { renderLatexToSvg } from './mathjax';
import { sampleCategories, type LatexSample, type LatexSampleCategory } from './samples';

const RENDER_DEBOUNCE_MS = 300;
const PREVIEW_SCALE_PROPERTY = '--preview-font-size';

const latexInput = getElement('latex-input', HTMLTextAreaElement);
const copyLatexButton = getElement('copy-latex-button', HTMLButtonElement);
const openSamplesButton = getElement('open-samples-button', HTMLButtonElement);
const closeSamplesButton = getElement('close-samples-button', HTMLButtonElement);
const openGreekButton = getElement('open-greek-button', HTMLButtonElement);
const closeGreekButton = getElement('close-greek-button', HTMLButtonElement);
const toolBoldButton = getElement('tool-bold-button', HTMLButtonElement);
const toolRomanButton = getElement('tool-roman-button', HTMLButtonElement);
const toolItalicButton = getElement('tool-italic-button', HTMLButtonElement);
const toolMathbfButton = getElement('tool-mathbf-button', HTMLButtonElement);
const toolMathbbButton = getElement('tool-mathbb-button', HTMLButtonElement);
const toolMathsfButton = getElement('tool-mathsf-button', HTMLButtonElement);
const toolMathcalButton = getElement('tool-mathcal-button', HTMLButtonElement);
const toolMathfrakButton = getElement('tool-mathfrak-button', HTMLButtonElement);
const toolWrapperButton = getElement('tool-wrapper-button', HTMLButtonElement);
const copyPngButton = getElement('copy-png-button', HTMLButtonElement);
const downloadSvgButton = getElement('download-svg-button', HTMLButtonElement);
const downloadPngButton = getElement('download-png-button', HTMLButtonElement);
const fontColorInput = getElement('font-color-input', HTMLInputElement);
const backgroundColorInput = getElement('background-color-input', HTMLInputElement);
const preview = getElement('preview', HTMLDivElement);
const message = getElement('message', HTMLParagraphElement);
const renderState = getElement('render-state', HTMLDivElement);
const sampleModal = getElement('sample-modal', HTMLDivElement);
const sampleCategoriesElement = getElement('sample-categories', HTMLElement);
const sampleList = getElement('sample-list', HTMLDivElement);
const greekModal = getElement('greek-modal', HTMLDivElement);
const greekList = getElement('greek-list', HTMLDivElement);

let renderTimer: number | undefined;
let renderToken = 0;
let currentSvg: SVGElement | null = null;
let selectedCategoryId = sampleCategories[0]?.id ?? '';
let samplePreviewToken = 0;
let greekPreviewToken = 0;
let focusedBeforeModal: HTMLElement | null = null;
let lastEditorSelection = { start: latexInput.value.length, end: latexInput.value.length };

type ParsedEditorContent =
  | { kind: 'latex'; latex: string }
  | { kind: 'wordpress-wrapper'; latex: string };

function normalizeLatexText(text: string): string {
  return text.replace(/[\u00a5\uffe5]/g, '\\');
}

function normalizeLatexInput(): void {
  const normalized = normalizeLatexText(latexInput.value);

  if (normalized === latexInput.value) {
    return;
  }

  const selectionStart = latexInput.selectionStart;
  const selectionEnd = latexInput.selectionEnd;
  latexInput.value = normalized;
  latexInput.setSelectionRange(selectionStart, selectionEnd);
}

function createWordPressWrapper(latex: string): string {
  return `<div style="overflow-x: auto;">\n\\[\n${latex}\n\\]\n</div>`;
}

function parseEditorContent(text: string): ParsedEditorContent {
  const trimmed = text.trim();
  const wrapperPattern =
    /^<div\s+style=(["'])overflow-x:\s*auto;\1>\s*\\\[([\s\S]*?)\\\]\s*<\/div>$/i;
  const wrapperMatch = trimmed.match(wrapperPattern);

  if (wrapperMatch) {
    return {
      kind: 'wordpress-wrapper',
      latex: wrapperMatch[2].trim(),
    };
  }

  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    throw new Error('Only the TeXportLab WordPress scroll wrapper is supported as HTML input.');
  }

  return { kind: 'latex', latex: trimmed };
}

function unwrapOuterCommand(text: string, command: string): string | null {
  const leadingWhitespaceLength = text.match(/^\s*/)?.[0].length ?? 0;
  const leading = text.slice(0, leadingWhitespaceLength);
  const body = text.slice(leadingWhitespaceLength);
  const prefix = `\\${command}{`;

  if (!body.startsWith(prefix)) {
    return null;
  }

  let depth = 1;
  const contentStart = prefix.length;

  for (let index = contentStart; index < body.length; index += 1) {
    const char = body[index];
    const previous = index > 0 ? body[index - 1] : '';

    if (previous === '\\') {
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        const content = body.slice(contentStart, index);
        const suffix = body.slice(index + 1);

        return `${leading}${content}${suffix}`;
      }
    }

    if (depth < 0) {
      break;
    }
  }

  return `${leading}${body.slice(contentStart)}`;
}

function getWordPressWrapperContent(text: string): string | null {
  const match = text.trim().match(/^<div\s+style=(["'])overflow-x:\s*auto;\1>\s*\\\[([\s\S]*?)\\\]\s*<\/div>$/i);

  return match ? match[2].trim() : null;
}

function replaceEditorRange(replacement: string, selectionStart: number, selectionEnd: number): void {
  latexInput.setRangeText(replacement, selectionStart, selectionEnd, 'select');
  latexInput.focus();
  updateLastEditorSelection();
  scheduleRender();
}

function getToolbarTargetRange(): { start: number; end: number; selectedText: string; usingWholeInput: boolean } {
  const start = latexInput.selectionStart;
  const end = latexInput.selectionEnd;

  if (start !== end) {
    return {
      start,
      end,
      selectedText: latexInput.value.slice(start, end),
      usingWholeInput: false,
    };
  }

  if (latexInput.value.length > 0) {
    return {
      start: 0,
      end: latexInput.value.length,
      selectedText: latexInput.value,
      usingWholeInput: true,
    };
  }

  return {
    start,
    end,
    selectedText: '',
    usingWholeInput: false,
  };
}

type ToggleCommand =
  | 'boldsymbol'
  | 'mathrm'
  | 'mathit'
  | 'mathbf'
  | 'mathbb'
  | 'mathsf'
  | 'mathcal'
  | 'mathfrak';

function toggleCommand(command: ToggleCommand): void {
  normalizeLatexInput();
  const { start, end, selectedText } = getToolbarTargetRange();
  const inner = unwrapOuterCommand(selectedText, command);

  if (inner !== null) {
    replaceEditorRange(inner, start, end);
    setMessage(`Removed \\${command}{...}.`, 'success');
    return;
  }

  const replacement = `\\${command}{${selectedText}}`;
  replaceEditorRange(replacement, start, end);

  if (!selectedText) {
    const cursor = start + command.length + 2;

    latexInput.setSelectionRange(cursor, cursor);
    updateLastEditorSelection();
  }

  setMessage(`Applied \\${command}{...}.`, 'success');
}

function updateLastEditorSelection(): void {
  lastEditorSelection = {
    start: latexInput.selectionStart,
    end: latexInput.selectionEnd,
  };
}

function getStoredEditorRange(): { start: number; end: number } {
  return {
    start: Math.min(lastEditorSelection.start, latexInput.value.length),
    end: Math.min(lastEditorSelection.end, latexInput.value.length),
  };
}

function insertLatexAtStoredRange(latex: string): void {
  normalizeLatexInput();
  const { start, end } = getStoredEditorRange();

  latexInput.setRangeText(latex, start, end, 'select');
  latexInput.focus();
  latexInput.setSelectionRange(start, start + latex.length);
  updateLastEditorSelection();
  void renderNow();
}

function insertSampleLatex(latex: string): void {
  insertLatexAtStoredRange(latex);
  closeSampleModal(false);
  setMessage('Sample inserted.', 'success');
}

function insertGreekLatex(latex: string): void {
  insertLatexAtStoredRange(latex);
  closeGreekModal(false);
  setMessage('Greek letter inserted.', 'success');
}

function toggleWordPressWrapper(): void {
  normalizeLatexInput();
  const { start, end, selectedText } = getToolbarTargetRange();
  const unwrapped = getWordPressWrapperContent(selectedText);

  if (unwrapped !== null) {
    replaceEditorRange(unwrapped, start, end);
    setMessage('Removed WordPress scroll wrapper.', 'success');
    return;
  }

  const replacement = createWordPressWrapper(selectedText);
  replaceEditorRange(replacement, start, end);

  if (!selectedText) {
    const cursor = start + '<div style="overflow-x: auto;">\n\\[\n'.length;

    latexInput.setSelectionRange(cursor, cursor);
    updateLastEditorSelection();
  }

  setMessage('Applied WordPress scroll wrapper.', 'success');
}

function getElement<T extends HTMLElement>(id: string, constructor: new () => T): T {
  const element = document.getElementById(id);

  if (!(element instanceof constructor)) {
    throw new Error(`Expected #${id} to be present.`);
  }

  return element;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error.';
}

function setMessage(text: string, kind: 'info' | 'error' | 'success' = 'info'): void {
  message.textContent = text;
  message.dataset.kind = kind;
}

function setRenderState(text: string, kind: 'idle' | 'busy' | 'error' | 'success' = 'idle'): void {
  renderState.textContent = text;
  renderState.dataset.kind = kind;
}

function setExportButtonsEnabled(enabled: boolean): void {
  copyPngButton.disabled = !enabled;
  downloadSvgButton.disabled = !enabled;
  downloadPngButton.disabled = !enabled;
}

function showPlaceholder(text: string): void {
  const placeholder = document.createElement('div');

  placeholder.className = 'preview-placeholder';
  placeholder.textContent = text;
  preview.replaceChildren(placeholder);
}

function invalidateCurrentSvg(): void {
  currentSvg = null;
  setExportButtonsEnabled(false);
}

function getSelectedPngScale(): number {
  const selected = document.querySelector<HTMLInputElement>('input[name="png-scale"]:checked');
  const scale = Number(selected?.value ?? 1);

  return [1, 2, 4].includes(scale) ? scale : 1;
}

function updatePreviewScale(): void {
  preview.style.setProperty(PREVIEW_SCALE_PROPERTY, `${getSelectedPngScale() * 100}%`);
}

function getSelectedFontColor(): string {
  return fontColorInput.value || '#000000';
}

function getSelectedBackgroundColor(): string {
  return backgroundColorInput.value || '#ffffff';
}

function updatePreviewColors(): void {
  preview.style.setProperty('--preview-font-color', getSelectedFontColor());
  preview.style.setProperty('--preview-background-color', getSelectedBackgroundColor());
}

async function renderNow(): Promise<void> {
  window.clearTimeout(renderTimer);
  normalizeLatexInput();
  updatePreviewScale();
  updatePreviewColors();
  const token = ++renderToken;
  const source = latexInput.value.trim();

  if (!source) {
    invalidateCurrentSvg();
    preview.classList.remove('preview--wrapped');
    showPlaceholder('No equation');
    setRenderState('Ready');
    setMessage('Enter a LaTeX equation.', 'error');
    return;
  }

  invalidateCurrentSvg();
  setRenderState('Rendering', 'busy');
  setMessage('');

  try {
    const parsed = parseEditorContent(source);
    const svg = await renderLatexToSvg(parsed.latex, preview);

    if (token !== renderToken) {
      return;
    }

    svg.classList.add('equation-svg');
    currentSvg = svg;
    preview.classList.toggle('preview--wrapped', parsed.kind === 'wordpress-wrapper');

    if (parsed.kind === 'wordpress-wrapper') {
      const scrollContainer = document.createElement('div');

      scrollContainer.className = 'preview-wrapper-scroll';
      scrollContainer.append(svg);
      preview.replaceChildren(scrollContainer);
    } else {
      preview.replaceChildren(svg);
    }

    setExportButtonsEnabled(true);
    setRenderState('Rendered', 'success');
  } catch (error) {
    if (token !== renderToken) {
      return;
    }

    invalidateCurrentSvg();
    preview.classList.remove('preview--wrapped');
    showPlaceholder('Render failed');
    setRenderState('Error', 'error');
    setMessage(getErrorMessage(error), 'error');
  }
}

function scheduleRender(): void {
  normalizeLatexInput();
  invalidateCurrentSvg();
  setRenderState('Queued', 'busy');
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(() => {
    void renderNow();
  }, RENDER_DEBOUNCE_MS);
}

async function writeTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const fallback = document.createElement('textarea');

    fallback.value = text;
    fallback.setAttribute('readonly', 'true');
    fallback.className = 'clipboard-fallback';
    document.body.append(fallback);
    fallback.select();

    const copied = document.execCommand('copy');
    fallback.remove();
    return copied;
  }
}

async function copyLatex(): Promise<void> {
  normalizeLatexInput();
  const latex = latexInput.value.trim();

  if (!latex) {
    setMessage('No LaTeX to copy.', 'error');
    return;
  }

  if (await writeTextToClipboard(latex)) {
    setMessage('LaTeX copied.', 'success');
    return;
  }

  setMessage('LaTeX copy failed.', 'error');
}

async function handlePngCopy(): Promise<void> {
  if (!currentSvg) {
    setMessage('Render an equation before copying PNG.', 'error');
    return;
  }

  if (!window.isSecureContext || !navigator.clipboard || typeof navigator.clipboard.write !== 'function') {
    setMessage('PNG clipboard copy requires localhost, HTTPS, and a compatible browser.', 'error');
    return;
  }

  copyPngButton.disabled = true;
  setMessage('Preparing PNG...');

  try {
    const pngBlob = await createPngBlob(currentSvg, getSelectedPngScale(), getSelectedFontColor());
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
    setMessage('PNG copied. Paste it with Ctrl+V or Command+V.', 'success');
  } catch (error) {
    setMessage(getErrorMessage(error), 'error');
  } finally {
    copyPngButton.disabled = currentSvg === null;
  }
}

async function handlePngDownload(): Promise<void> {
  if (!currentSvg) {
    setMessage('Render an equation before downloading PNG.', 'error');
    return;
  }

  downloadPngButton.disabled = true;
  setMessage('Preparing PNG...');

  try {
    await downloadPng(currentSvg, 'texport-equation.png', getSelectedPngScale(), getSelectedFontColor());
    setMessage('PNG download started.', 'success');
  } catch (error) {
    setMessage(getErrorMessage(error), 'error');
  } finally {
    downloadPngButton.disabled = currentSvg === null;
  }
}

function handleSvgDownload(): void {
  if (!currentSvg) {
    setMessage('Render an equation before downloading SVG.', 'error');
    return;
  }

  try {
    downloadSvg(currentSvg, 'texport-equation.svg', getSelectedFontColor());
    setMessage('SVG download started.', 'success');
  } catch (error) {
    setMessage(getErrorMessage(error), 'error');
  }
}

function getSelectedCategory(): LatexSampleCategory {
  return sampleCategories.find((category) => category.id === selectedCategoryId) ?? sampleCategories[0];
}

function mountSampleCategories(): void {
  const fragment = document.createDocumentFragment();

  for (const category of sampleCategories) {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'category-button';
    button.textContent = category.label;
    button.dataset.categoryId = category.id;
    button.setAttribute('aria-pressed', String(category.id === selectedCategoryId));
    button.addEventListener('click', () => {
      selectedCategoryId = category.id;
      mountSampleCategories();
      mountSampleList();
    });
    fragment.append(button);
  }

  sampleCategoriesElement.replaceChildren(fragment);
}

function createSampleCard(sample: LatexSample): HTMLElement {
  const card = document.createElement('article');
  const button = document.createElement('button');
  const content = document.createElement('span');
  const previewSlot = document.createElement('span');
  const text = document.createElement('span');
  const label = document.createElement('span');
  const code = document.createElement('code');

  card.className = 'sample-card';
  card.dataset.sampleId = sample.id;
  button.type = 'button';
  button.className = 'sample-select-button';

  previewSlot.className = 'sample-preview';
  previewSlot.textContent = 'Rendering...';

  content.className = 'sample-card-content';
  label.className = 'sample-card-label';
  label.textContent = sample.label;
  code.className = 'sample-code';
  code.textContent = sample.latex;
  text.className = 'sample-card-text';
  text.append(label, code);

  content.append(previewSlot, text);
  button.append(content);
  card.append(button);

  if (sample.note) {
    const note = document.createElement('span');

    note.className = 'sample-note';
    note.textContent = sample.note;
    card.append(note);
  }

  const selectSample = () => {
    insertSampleLatex(sample.latex);
  };

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    selectSample();
  });
  card.addEventListener('click', (event) => {
    event.stopPropagation();
    selectSample();
  });

  return card;
}

function mountSampleList(): void {
  const category = getSelectedCategory();
  const fragment = document.createDocumentFragment();

  samplePreviewToken += 1;
  for (const sample of category.samples) {
    fragment.append(createSampleCard(sample));
  }

  sampleList.replaceChildren(fragment);
  void renderSamplePreviews(category, samplePreviewToken);
}

async function renderSamplePreviews(category: LatexSampleCategory, token: number): Promise<void> {
  for (const sample of category.samples) {
    if (token !== samplePreviewToken || sampleModal.hidden) {
      return;
    }

    const card = sampleList.querySelector<HTMLButtonElement>(`.sample-card[data-sample-id="${sample.id}"]`);
    const previewSlot = card?.querySelector<HTMLElement>('.sample-preview');

    if (!previewSlot) {
      continue;
    }

    try {
      const svg = await renderLatexToSvg(sample.latex, previewSlot);

      if (token !== samplePreviewToken) {
        return;
      }

      svg.classList.add('sample-equation-svg');
      previewSlot.replaceChildren(svg);
    } catch {
      previewSlot.textContent = 'Preview failed';
    }
  }
}

function createGreekCard(letter: GreekLetter): HTMLElement {
  const card = document.createElement('article');
  const button = document.createElement('button');
  const content = document.createElement('span');
  const previewSlot = document.createElement('span');
  const text = document.createElement('span');
  const label = document.createElement('span');
  const code = document.createElement('code');

  card.className = 'sample-card greek-card';
  card.dataset.greekId = letter.id;
  button.type = 'button';
  button.className = 'sample-select-button';

  previewSlot.className = 'sample-preview greek-preview';
  previewSlot.textContent = 'Rendering...';

  content.className = 'sample-card-content greek-card-content';
  label.className = 'sample-card-label';
  label.textContent = letter.label;
  code.className = 'sample-code';
  code.textContent = letter.latex;
  text.className = 'sample-card-text';
  text.append(label, code);

  content.append(previewSlot, text);
  button.append(content);
  card.append(button);

  if (letter.note) {
    const note = document.createElement('span');

    note.className = 'sample-note';
    note.textContent = letter.note;
    card.append(note);
  }

  const selectLetter = () => {
    insertGreekLatex(letter.latex);
  };

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    selectLetter();
  });
  card.addEventListener('click', (event) => {
    event.stopPropagation();
    selectLetter();
  });

  return card;
}

function mountGreekList(): void {
  const fragment = document.createDocumentFragment();

  greekPreviewToken += 1;
  for (const letter of greekLetters) {
    fragment.append(createGreekCard(letter));
  }

  greekList.replaceChildren(fragment);
  void renderGreekPreviews(greekPreviewToken);
}

async function renderGreekPreviews(token: number): Promise<void> {
  for (const letter of greekLetters) {
    if (token !== greekPreviewToken || greekModal.hidden) {
      return;
    }

    const card = greekList.querySelector<HTMLButtonElement>(`.greek-card[data-greek-id="${letter.id}"]`);
    const previewSlot = card?.querySelector<HTMLElement>('.greek-preview');

    if (!previewSlot) {
      continue;
    }

    try {
      const svg = await renderLatexToSvg(letter.latex, previewSlot);

      if (token !== greekPreviewToken) {
        return;
      }

      svg.classList.add('sample-equation-svg');
      previewSlot.replaceChildren(svg);
    } catch {
      previewSlot.textContent = 'Preview failed';
    }
  }
}

function getFocusableModalElements(): HTMLElement[] {
  const activeModal = sampleModal.hidden ? greekModal : sampleModal;

  return Array.from(
    activeModal.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
}

function trapModalFocus(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || (sampleModal.hidden && greekModal.hidden)) {
    return;
  }

  const focusable = getFocusableModalElements();

  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openSampleModal(): void {
  updateLastEditorSelection();
  focusedBeforeModal = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  greekModal.hidden = true;
  sampleModal.hidden = false;
  document.body.classList.add('modal-open');
  mountSampleCategories();
  mountSampleList();
  closeSamplesButton.focus();
}

function closeSampleModal(restoreFocus = true): void {
  samplePreviewToken += 1;
  sampleModal.hidden = true;
  document.body.classList.remove('modal-open');

  if (restoreFocus) {
    focusedBeforeModal?.focus();
  }
}

function openGreekModal(): void {
  updateLastEditorSelection();
  focusedBeforeModal = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  sampleModal.hidden = true;
  greekModal.hidden = false;
  document.body.classList.add('modal-open');
  mountGreekList();
  closeGreekButton.focus();
}

function closeGreekModal(restoreFocus = true): void {
  greekPreviewToken += 1;
  greekModal.hidden = true;
  document.body.classList.remove('modal-open');

  if (restoreFocus) {
    focusedBeforeModal?.focus();
  }
}

latexInput.addEventListener('input', () => {
  updateLastEditorSelection();
  scheduleRender();
});
latexInput.addEventListener('click', updateLastEditorSelection);
latexInput.addEventListener('keyup', updateLastEditorSelection);
latexInput.addEventListener('select', updateLastEditorSelection);
toolBoldButton.addEventListener('click', () => toggleCommand('boldsymbol'));
toolRomanButton.addEventListener('click', () => toggleCommand('mathrm'));
toolItalicButton.addEventListener('click', () => toggleCommand('mathit'));
toolMathbfButton.addEventListener('click', () => toggleCommand('mathbf'));
toolMathbbButton.addEventListener('click', () => toggleCommand('mathbb'));
toolMathsfButton.addEventListener('click', () => toggleCommand('mathsf'));
toolMathcalButton.addEventListener('click', () => toggleCommand('mathcal'));
toolMathfrakButton.addEventListener('click', () => toggleCommand('mathfrak'));
toolWrapperButton.addEventListener('click', toggleWordPressWrapper);
copyLatexButton.addEventListener('click', () => {
  void copyLatex();
});
openSamplesButton.addEventListener('click', openSampleModal);
closeSamplesButton.addEventListener('click', () => closeSampleModal());
openGreekButton.addEventListener('click', openGreekModal);
closeGreekButton.addEventListener('click', () => closeGreekModal());
sampleModal.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).hasAttribute('data-close-samples')) {
    closeSampleModal();
  }
});
greekModal.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).hasAttribute('data-close-greek')) {
    closeGreekModal();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!sampleModal.hidden) {
      closeSampleModal();
      return;
    }

    if (!greekModal.hidden) {
      closeGreekModal();
      return;
    }

    return;
  }

  trapModalFocus(event);
});
copyPngButton.addEventListener('click', () => {
  void handlePngCopy();
});
downloadSvgButton.addEventListener('click', handleSvgDownload);
downloadPngButton.addEventListener('click', () => {
  void handlePngDownload();
});
document.querySelectorAll<HTMLInputElement>('input[name="png-scale"]').forEach((input) => {
  input.addEventListener('change', updatePreviewScale);
});
fontColorInput.addEventListener('input', updatePreviewColors);
backgroundColorInput.addEventListener('input', updatePreviewColors);

updatePreviewScale();
updatePreviewColors();
void renderNow();
