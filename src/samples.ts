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
    id: 'basic-operators',
    label: 'Basic operators',
    samples: [
      { id: 'plus', label: 'plus', latex: 'A + B' },
      { id: 'minus', label: 'minus', latex: 'A - B' },
      { id: 'plus-minus', label: 'plus minus', latex: 'A \\pm B' },
      { id: 'minus-plus', label: 'minus plus', latex: 'A \\mp B' },
      { id: 'times', label: 'times', latex: 'A \\times B' },
      { id: 'dot-product', label: 'center dot', latex: 'A \\cdot B' },
      { id: 'asterisk', label: 'asterisk', latex: 'A \\ast B' },
      { id: 'division-symbol', label: 'division symbol', latex: 'A \\div B' },
      { id: 'slash-division', label: 'slash division', latex: 'A / B' },
      { id: 'fraction', label: 'fraction', latex: '\\frac{A}{B}' },
    ],
  },
  {
    id: 'powers-roots',
    label: 'Powers and roots',
    samples: [
      { id: 'power', label: 'power', latex: 'A^x' },
      { id: 'factorial', label: 'factorial', latex: 'A!' },
      { id: 'square-root', label: 'square root', latex: '\\sqrt{A}' },
      { id: 'cube-root', label: 'cube root', latex: '\\sqrt[3]{A}' },
      { id: 'nth-root', label: 'nth root', latex: '\\sqrt[n]{A}' },
    ],
  },
  {
    id: 'relations',
    label: 'Relations',
    samples: [
      { id: 'equals', label: 'equals', latex: 'A = B' },
      { id: 'not-equals', label: 'not equals', latex: 'A \\neq B' },
      { id: 'similar', label: 'similar', latex: 'A \\sim B' },
      { id: 'simeq', label: 'similar or equal', latex: 'A \\simeq B' },
      { id: 'approx', label: 'approximately', latex: 'A \\approx B' },
      { id: 'congruent', label: 'congruent', latex: 'A \\cong B' },
      { id: 'less-than', label: 'less than', latex: 'A \\lt B' },
      { id: 'less-equal', label: 'less or equal', latex: 'A \\le B' },
      { id: 'greater-than', label: 'greater than', latex: 'A \\gt B' },
      { id: 'greater-equal', label: 'greater or equal', latex: 'A \\ge B' },
      { id: 'much-greater', label: 'much greater', latex: 'A \\gg B' },
      { id: 'much-less', label: 'much less', latex: 'A \\ll B' },
    ],
  },
  {
    id: 'logic',
    label: 'Logic',
    samples: [
      { id: 'land', label: 'logical and', latex: 'P \\land Q' },
      { id: 'lor', label: 'logical or', latex: 'P \\lor Q' },
      { id: 'oplus', label: 'exclusive or', latex: 'P \\oplus Q' },
      { id: 'not', label: 'logical not', latex: '\\lnot P' },
      { id: 'equiv', label: 'equivalent', latex: 'P \\equiv Q' },
    ],
  },
  {
    id: 'limits-calculus',
    label: 'Limits and calculus',
    samples: [
      { id: 'limit', label: 'limit', latex: '\\lim f(x)' },
      { id: 'limit-to-zero', label: 'limit to zero', latex: '\\lim_{n \\to 0} a_n' },
      { id: 'limit-to-infinity', label: 'limit to infinity', latex: '\\lim_{n \\to \\infty} a_n' },
      { id: 'integral', label: 'integral', latex: '\\int f(x)\\,\\mathrm{d}x' },
      { id: 'improper-integral', label: 'improper integral', latex: '\\int_{0}^{\\infty} f(x)\\,\\mathrm{d}x' },
      { id: 'double-integral', label: 'double integral', latex: '\\iint_D f(x,y)\\,\\mathrm{d}A' },
      { id: 'triple-integral', label: 'triple integral', latex: '\\iiint_V f(x,y,z)\\,\\mathrm{d}V' },
    ],
  },
  {
    id: 'arrows',
    label: 'Arrows',
    samples: [
      { id: 'rightarrow', label: 'right arrow', latex: 'A \\rightarrow B' },
      { id: 'leftarrow', label: 'left arrow', latex: 'A \\leftarrow B' },
      { id: 'leftrightarrow', label: 'left right arrow', latex: 'A \\leftrightarrow B' },
      { id: 'Rightarrow', label: 'right double arrow', latex: 'A \\Rightarrow B' },
      { id: 'Leftarrow', label: 'left double arrow', latex: 'A \\Leftarrow B' },
      { id: 'Leftrightarrow', label: 'left right double arrow', latex: 'A \\Leftrightarrow B' },
      { id: 'longrightarrow', label: 'long right arrow', latex: 'A \\longrightarrow B' },
      { id: 'longleftrightarrow', label: 'long left right arrow', latex: 'A \\longleftrightarrow B' },
      { id: 'Longrightarrow', label: 'long right double arrow', latex: 'A \\Longrightarrow B' },
      { id: 'Longleftrightarrow', label: 'long left right double arrow', latex: 'A \\Longleftrightarrow B' },
    ],
  },
  {
    id: 'functions-combinatorics',
    label: 'Functions',
    samples: [
      { id: 'permutation', label: 'permutation', latex: '{}_nP_k' },
      { id: 'exp-function', label: 'exp function', latex: '\\exp(x)' },
      { id: 'e-power', label: 'exponential', latex: 'e^x' },
      { id: 'upright-e-power', label: 'upright e', latex: '\\mathrm{e}^x' },
      { id: 'log10', label: 'common logarithm', latex: '\\log_{10}x' },
      { id: 'log2', label: 'binary logarithm', latex: '\\log_2x' },
    ],
  },
  {
    id: 'statistics',
    label: 'Statistics',
    samples: [
      { id: 'mean-bar', label: 'bar notation', latex: '\\bar{x}' },
      { id: 'summation', label: 'summation', latex: '\\sum_{k=1}^{n} A_k' },
      { id: 'product', label: 'product', latex: '\\prod_{k=1}^{n} B_k' },
    ],
  },
  {
    id: 'geometry-operators',
    label: 'Geometry',
    samples: [
      { id: 'parallel', label: 'parallel', latex: 'AB \\parallel CD' },
      { id: 'perpendicular', label: 'perpendicular', latex: 'AB \\perp CD' },
      { id: 'composition', label: 'function composition', latex: '(g \\circ f)(x)' },
      { id: 'indexed-point', label: 'subscripted point', latex: 'P_n' },
    ],
  },
  {
    id: 'brackets',
    label: 'Brackets',
    samples: [
      { id: 'braces', label: 'braces', latex: '\\lbrace H \\rbrace' },
      { id: 'brackets', label: 'brackets', latex: '\\lbrack I \\rbrack' },
      { id: 'angle-brackets', label: 'angle brackets', latex: '\\langle J \\rangle' },
      { id: 'absolute-value', label: 'absolute value', latex: '\\lvert K \\rvert' },
      { id: 'norm', label: 'norm', latex: '\\lVert L \\rVert' },
      { id: 'floor', label: 'floor', latex: '\\lfloor M \\rfloor' },
      { id: 'ceiling', label: 'ceiling', latex: '\\lceil N \\rceil' },
      { id: 'auto-sized-parentheses', label: 'auto-sized parentheses', latex: '\\left( \\frac{A}{B} \\right)' },
      { id: 'auto-sized-brackets', label: 'auto-sized brackets', latex: '\\left[ \\sum_{k=1}^{n} A_k \\right]' },
    ],
  },
  {
    id: 'sets',
    label: 'Sets',
    samples: [
      { id: 'in', label: 'element of', latex: 'x \\in A' },
      { id: 'contains-as-member', label: 'contains as member', latex: 'A \\ni x' },
      { id: 'not-in', label: 'not element of', latex: 'x \\not\\in A' },
      { id: 'not-contains-as-member', label: 'does not contain as member', latex: 'A \\not\\ni x' },
      { id: 'subset', label: 'subset', latex: 'A \\subset B' },
      { id: 'superset', label: 'superset', latex: 'A \\supset B' },
      { id: 'subseteq', label: 'subset or equal', latex: 'A \\subseteq B' },
      { id: 'supseteq', label: 'superset or equal', latex: 'A \\supseteq B' },
      { id: 'not-subset', label: 'not subset', latex: 'A \\not\\subset B' },
      { id: 'union', label: 'union', latex: 'A \\cup B' },
      { id: 'intersection', label: 'intersection', latex: 'A \\cap B' },
      { id: 'set-difference', label: 'set difference', latex: 'A \\backslash B' },
      { id: 'complement-power', label: 'complement', latex: 'A^c' },
      { id: 'complement-overline', label: 'overline complement', latex: '\\overline{A}' },
      { id: 'empty-set', label: 'empty set', latex: '\\emptyset' },
      { id: 'de-morgan-union', label: 'De Morgan: union', latex: '\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}' },
      { id: 'de-morgan-intersection', label: 'De Morgan: intersection', latex: '\\overline{A \\cap B} = \\overline{A} \\cup \\overline{B}' },
    ],
  },
  {
    id: 'number-sets',
    label: 'Number sets',
    samples: [
      { id: 'natural-numbers', label: 'natural numbers', latex: '\\mathbb{N}' },
      { id: 'integers', label: 'integers', latex: '\\mathbb{Z}' },
      { id: 'rationals', label: 'rationals', latex: '\\mathbb{Q}' },
      { id: 'reals', label: 'real numbers', latex: '\\mathbb{R}' },
      { id: 'complex', label: 'complex numbers', latex: '\\mathbb{C}' },
      { id: 'quaternions', label: 'quaternions', latex: '\\mathbb{H}' },
    ],
  },
  {
    id: 'aligned',
    label: 'Aligned',
    samples: [
      {
        id: 'aligned-equals',
        label: 'full equation: aligned equals',
        latex: '\\begin{aligned}\na + b &= c \\\\\nx + y &= z\n\\end{aligned}',
      },
      {
        id: 'derivation',
        label: 'full equation: derivation',
        latex: '\\begin{aligned}\n(a+b)^2 &= (a+b)(a+b) \\\\\n&= a^2 + 2ab + b^2\n\\end{aligned}',
      },
      {
        id: 'cases',
        label: 'full equation: cases',
        latex: 'f(x) = \\begin{cases}\nx^2 & x \\ge 0 \\\\\n-x & x < 0\n\\end{cases}',
      },
    ],
  },
  {
    id: 'differential',
    label: 'Differential',
    samples: [
      { id: 'ordinary-derivative', label: 'ordinary derivative', latex: '\\frac{\\mathrm{d} y}{\\mathrm{d} x}' },
      {
        id: 'partial-derivative',
        label: 'full equation: partial derivative',
        latex: '\\frac{\\partial u}{\\partial t} = \\alpha \\frac{\\partial^2 u}{\\partial x^2}',
      },
      { id: 'dot-notation', label: 'dot notation', latex: '\\dot{x},\\quad \\ddot{x}' },
      { id: 'operator-parentheses', label: 'differential operator', latex: '\\left(\\frac{\\mathrm{d}}{\\mathrm{d}x} + x\\right)' },
    ],
  },
  {
    id: 'matrices',
    label: 'Matrices',
    samples: [
      {
        id: 'pmatrix',
        label: 'parenthesis matrix',
        latex: '\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}',
      },
      {
        id: 'bmatrix',
        label: 'bracket matrix',
        latex: '\\begin{bmatrix}\n1 & 0 & 0 \\\\\n0 & 1 & 0 \\\\\n0 & 0 & 1\n\\end{bmatrix}',
      },
      {
        id: 'matrix-product',
        label: 'full equation: matrix product',
        latex: '\\mathbf{M}\\mathbf{x} = \\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}\\begin{bmatrix}\nx \\\\\ny\n\\end{bmatrix}',
      },
      {
        id: 'determinant',
        label: 'determinant',
        latex: '\\det\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}',
      },
      { id: 'vector-norm', label: 'vector norm', latex: '\\lVert \\mathbf{x} \\rVert_2' },
    ],
  },
];
