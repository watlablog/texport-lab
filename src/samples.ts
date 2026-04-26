export interface LatexSample {
  id: string;
  label: string;
  latex: string;
  note?: string;
}

export interface LatexSampleCategory {
  id: string;
  label: string;
  samples: LatexSample[];
}

export const sampleCategories: LatexSampleCategory[] = [
  {
    id: 'elementary',
    label: 'Elementary',
    samples: [
      {
        id: 'simple-assignment',
        label: 'Full equation: assignment',
        latex: 'a = 1',
      },
      {
        id: 'circle',
        label: 'Full equation: circle',
        latex: 'x^2 + y^2 = r^2',
      },
      {
        id: 'fraction',
        label: 'Expression: fraction',
        latex: '\\frac{x + 1}{x - 1}',
      },
      {
        id: 'radical',
        label: 'Expression: square root',
        latex: '\\sqrt{x^2 + y^2}',
      },
      {
        id: 'summation',
        label: 'Expression: summation',
        latex: '\\sum_{k=1}^{n} k',
      },
      {
        id: 'integral',
        label: 'Expression: integral',
        latex: '\\int_{0}^{1} x^2\\,\\mathrm{d}x',
      },
    ],
  },
  {
    id: 'alignment',
    label: 'Aligned',
    samples: [
      {
        id: 'aligned-equals',
        label: 'Full equation: aligned equals',
        latex: '\\begin{aligned}\na + b &= c \\\\\nx + y &= z\n\\end{aligned}',
      },
      {
        id: 'derivation',
        label: 'Full equation: derivation',
        latex: '\\begin{aligned}\n(a+b)^2 &= (a+b)(a+b) \\\\\n&= a^2 + 2ab + b^2\n\\end{aligned}',
      },
      {
        id: 'cases',
        label: 'Full equation: cases',
        latex: 'f(x) = \\begin{cases}\nx^2 & x \\ge 0 \\\\\n-x & x < 0\n\\end{cases}',
      },
      {
        id: 'piecewise-text',
        label: 'Full equation: cases with text',
        latex: 'u(t) = \\begin{cases}\n0 & \\mathrm{if}\\ t < 0 \\\\\n1 & \\mathrm{if}\\ t \\ge 0\n\\end{cases}',
      },
    ],
  },
  {
    id: 'differential',
    label: 'Differential',
    samples: [
      {
        id: 'ordinary-derivative',
        label: 'Expression: ordinary derivative',
        latex: '\\frac{d y}{d x}',
      },
      {
        id: 'upright-d',
        label: 'Expression: upright differential d',
        latex: '\\frac{\\mathrm{d} y}{\\mathrm{d} x}',
      },
      {
        id: 'partial-derivative',
        label: 'Full equation: partial derivative',
        latex: '\\frac{\\partial u}{\\partial t} = \\alpha \\frac{\\partial^2 u}{\\partial x^2}',
      },
      {
        id: 'dot-notation',
        label: 'Expression: dot notation',
        latex: '\\dot{x},\\quad \\ddot{x}',
      },
      {
        id: 'operator-parentheses',
        label: 'Expression: differential operator',
        latex: '\\left(\\frac{d}{dx} + x\\right)',
      },
      {
        id: 'ode-system',
        label: 'Full equation: ODE system',
        latex: '\\begin{aligned}\n\\dot{x} &= ax + by \\\\\n\\dot{y} &= cx + dy\n\\end{aligned}',
      },
    ],
  },
  {
    id: 'linear-algebra',
    label: 'Matrices',
    samples: [
      {
        id: 'pmatrix',
        label: 'Expression: parenthesis matrix',
        latex: '\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}',
      },
      {
        id: 'bmatrix',
        label: 'Expression: bracket matrix',
        latex: '\\begin{bmatrix}\n1 & 0 & 0 \\\\\n0 & 1 & 0 \\\\\n0 & 0 & 1\n\\end{bmatrix}',
      },
      {
        id: 'matrix-product',
        label: 'Full equation: matrix product',
        latex: '\\mathbf{M}\\mathbf{x} = \\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}\\begin{bmatrix}\nx \\\\\ny\n\\end{bmatrix}',
      },
      {
        id: 'determinant',
        label: 'Expression: determinant',
        latex: '\\det\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}',
      },
      {
        id: 'vector-norm',
        label: 'Expression: vector norm',
        latex: '\\lVert \\mathbf{x} \\rVert_2',
      },
    ],
  },
  {
    id: 'notation',
    label: 'Notation',
    samples: [
      {
        id: 'roman-functions',
        label: 'Expression: roman functions',
        latex: '\\mathrm{sin}\\,x + \\mathrm{cos}\\,x',
      },
      {
        id: 'bold-vector',
        label: 'Expression: bold vector',
        latex: '\\mathbf{x}',
      },
      {
        id: 'boldsymbol-greek',
        label: 'Expression: bold Greek',
        latex: '\\boldsymbol{\\alpha}',
      },
      {
        id: 'mathit-versus-mathrm',
        label: 'Expression: italic vs roman',
        latex: '\\mathit{rate} \\ne \\mathrm{rate}',
      },
      {
        id: 'units',
        label: 'Expression: units',
        latex: '12\\,\\mathrm{m}\\,\\mathrm{s}^{-1}',
      },
    ],
  },
];
