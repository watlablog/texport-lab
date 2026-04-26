type MathJaxConversionOptions = {
  display?: boolean;
  em?: number;
  ex?: number;
  containerWidth?: number;
};

type MathJaxRuntime = {
  startup: {
    promise: Promise<void>;
    typeset?: boolean;
  };
  tex2svgPromise: (latex: string, options?: MathJaxConversionOptions) => Promise<HTMLElement>;
};

type MathJaxConfig = {
  startup?: {
    promise?: Promise<void>;
    typeset?: boolean;
  };
  tex2svgPromise?: (latex: string, options?: MathJaxConversionOptions) => Promise<HTMLElement>;
  loader?: Record<string, unknown>;
  options?: Record<string, unknown>;
  tex?: Record<string, unknown>;
  svg?: Record<string, unknown>;
  output?: Record<string, unknown>;
};

declare global {
  interface Window {
    MathJax?: MathJaxConfig;
  }
}

let mathJaxReady: Promise<MathJaxRuntime> | null = null;

function withTimeout<T>(promise: Promise<T>, message: string, timeoutMs = 12000): Promise<T> {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function getAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${path}`;
}

function configureMathJax(): void {
  window.MathJax = {
    startup: {
      typeset: false,
    },
    loader: {
      load: ['[tex]/boldsymbol'],
      paths: {
        mathjax: getAssetUrl('vendor/mathjax'),
        'mathjax-newcm': getAssetUrl('vendor/mathjax-newcm-font'),
      },
    },
    options: {
      enableMenu: false,
      enableExplorer: false,
      enableEnrichment: false,
      enableSpeech: false,
      enableBraille: false,
      menuOptions: {
        settings: {
          enrich: false,
          speech: false,
          braille: false,
          collapsible: false,
        },
      },
    },
    tex: {
      packages: { '[+]': ['boldsymbol'] },
    },
    svg: {
      fontCache: 'local',
    },
    output: {
      fontPath: getAssetUrl('vendor/mathjax-newcm-font'),
    },
  };
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[data-mathjax-loader="${src}"]`);

    if (existingScript?.dataset.loaded === 'true') {
      resolve();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('MathJax could not be loaded.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.mathjaxLoader = src;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => reject(new Error('MathJax could not be loaded.')), {
      once: true,
    });
    document.head.append(script);
  });
}

function hasMathJaxStartup(mathJax: MathJaxConfig | undefined): mathJax is MathJaxConfig & {
  startup: { promise: Promise<void>; typeset?: boolean };
} {
  return Boolean(mathJax?.startup?.promise);
}

function hasMathJaxRuntime(mathJax: MathJaxConfig | undefined): mathJax is MathJaxRuntime {
  return hasMathJaxStartup(mathJax) && typeof mathJax.tex2svgPromise === 'function';
}

async function getMathJax(): Promise<MathJaxRuntime> {
  if (!mathJaxReady) {
    mathJaxReady = (async () => {
      configureMathJax();
      await loadScript(getAssetUrl('vendor/mathjax/tex-svg.js'));

      if (!hasMathJaxStartup(window.MathJax)) {
        throw new Error('MathJax startup promise is not available.');
      }

      await withTimeout(window.MathJax.startup.promise, 'MathJax initialization timed out.');

      if (!hasMathJaxRuntime(window.MathJax)) {
        throw new Error('MathJax SVG renderer is not available.');
      }

      return window.MathJax;
    })();
  }

  return mathJaxReady;
}

function stripDisplayDelimiters(latex: string): string {
  const trimmed = latex.trim();
  const patterns = [/^\$\$([\s\S]*)\$\$$/, /^\\\[([\s\S]*)\\\]$/, /^\\\(([\s\S]*)\\\)$/];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return trimmed;
}

export async function renderLatexToSvg(latex: string, metricsElement: HTMLElement): Promise<SVGElement> {
  const normalizedLatex = stripDisplayDelimiters(latex);

  if (!normalizedLatex) {
    throw new Error('Enter a LaTeX equation.');
  }

  const mathJax = await getMathJax();
  const metrics = metricsElement.getBoundingClientRect();
  const node = await withTimeout(
    mathJax.tex2svgPromise(normalizedLatex, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: Math.max(320, Math.floor(metrics.width)),
    }),
    'MathJax rendering timed out.',
  );
  const svg = node.querySelector('svg');

  if (!svg) {
    throw new Error('MathJax did not return an SVG element.');
  }

  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('tabindex');
  return clone;
}
