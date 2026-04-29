const SVG_NS = ['http:', '', 'www.w3.org', '2000', 'svg'].join('/');
const DEFAULT_PADDING_PX = 12;
const SVG_FILENAME = 'texport-equation.svg';
const PNG_FILENAME = 'texport-equation.png';

type SvgBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type StandaloneSvg = {
  text: string;
  width: number;
  height: number;
};

type StandaloneSvgOptions = {
  paddingPx?: number;
  includeBackground?: boolean;
  backgroundColor?: string;
  color?: string;
};

function parseViewBox(value: string | null): SvgBox | null {
  if (!value) {
    return null;
  }

  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [x, y, width, height] = parts;

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
}

function readSvgBox(svg: SVGElement): SvgBox {
  try {
    const box = (svg as SVGGraphicsElement).getBBox();

    if (box.width > 0 && box.height > 0) {
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
    }
  } catch {
    // Hidden or detached SVGs may not expose getBBox().
  }

  const viewBox = parseViewBox(svg.getAttribute('viewBox'));

  if (viewBox) {
    return viewBox;
  }

  return {
    x: 0,
    y: 0,
    width: Math.max(1, svg.getBoundingClientRect().width),
    height: Math.max(1, svg.getBoundingClientRect().height),
  };
}

function readRenderedSize(svg: SVGElement, fallbackBox: SvgBox): { width: number; height: number } {
  const rect = svg.getBoundingClientRect();

  if (rect.width > 0 && rect.height > 0) {
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  return {
    width: Math.max(1, Math.ceil(fallbackBox.width / 1000) * 16),
    height: Math.max(1, Math.ceil(fallbackBox.height / 1000) * 16),
  };
}

function createStandaloneSvg(svg: SVGElement, options: StandaloneSvgOptions = {}): StandaloneSvg {
  const {
    paddingPx = DEFAULT_PADDING_PX,
    includeBackground = false,
    backgroundColor = '#ffffff',
    color = '#111111',
  } = options;
  const source = svg.cloneNode(true) as SVGElement;
  const box = readSvgBox(svg);
  const renderedSize = readRenderedSize(svg, box);
  const paddingX = (paddingPx * box.width) / renderedSize.width;
  const paddingY = (paddingPx * box.height) / renderedSize.height;
  const viewBox = {
    x: box.x - paddingX,
    y: box.y - paddingY,
    width: box.width + paddingX * 2,
    height: box.height + paddingY * 2,
  };
  const outputWidth = Math.max(1, Math.ceil(renderedSize.width + paddingPx * 2));
  const outputHeight = Math.max(1, Math.ceil(renderedSize.height + paddingPx * 2));

  source.removeAttribute('style');
  source.setAttribute('xmlns', SVG_NS);
  source.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  source.setAttribute('width', String(outputWidth));
  source.setAttribute('height', String(outputHeight));
  source.setAttribute('color', color);

  if (includeBackground) {
    const background = document.createElementNS(SVG_NS, 'rect');

    background.setAttribute('x', String(viewBox.x));
    background.setAttribute('y', String(viewBox.y));
    background.setAttribute('width', String(viewBox.width));
    background.setAttribute('height', String(viewBox.height));
    background.setAttribute('fill', backgroundColor);
    source.insertBefore(background, source.firstChild);
  }

  const serialized = new XMLSerializer().serializeToString(source);

  return {
    text: `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`,
    width: outputWidth,
    height: outputHeight,
  };
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error('SVG could not be converted to an image.')), {
      once: true,
    });
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('PNG export failed.'));
    }, 'image/png');
  });
}

export function serializeSvg(
  svgElement: SVGElement,
  color = '#111111',
  includeBackground = false,
  backgroundColor = '#ffffff',
): string {
  return createStandaloneSvg(svgElement, { color, includeBackground, backgroundColor }).text;
}

export function downloadSvg(
  svgElement: SVGElement,
  filename = SVG_FILENAME,
  color = '#111111',
  includeBackground = false,
  backgroundColor = '#ffffff',
): void {
  const svgText = serializeSvg(svgElement, color, includeBackground, backgroundColor);
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}

export async function createPngBlob(
  svgElement: SVGElement,
  scale = 1,
  color = '#111111',
  includeBackground = false,
  backgroundColor = '#ffffff',
): Promise<Blob> {
  const normalizedScale = [1, 2, 4].includes(scale) ? scale : 1;
  const standaloneSvg = createStandaloneSvg(svgElement, {
    color,
    includeBackground,
    backgroundColor,
    paddingPx: DEFAULT_PADDING_PX,
  });
  const svgBlob = new Blob([standaloneSvg.text], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is not available.');
    }

    canvas.width = Math.max(1, Math.round(standaloneSvg.width * normalizedScale));
    canvas.height = Math.max(1, Math.round(standaloneSvg.height * normalizedScale));
    context.scale(normalizedScale, normalizedScale);
    context.drawImage(image, 0, 0, standaloneSvg.width, standaloneSvg.height);

    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function downloadPng(
  svgElement: SVGElement,
  filename = PNG_FILENAME,
  scale = 1,
  color = '#111111',
  includeBackground = false,
  backgroundColor = '#ffffff',
): Promise<void> {
  const pngBlob = await createPngBlob(svgElement, scale, color, includeBackground, backgroundColor);
  downloadBlob(pngBlob, filename);
}
