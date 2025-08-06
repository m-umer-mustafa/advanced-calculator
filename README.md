
```markdown
# Advanced Calculator Express - Project Documentation

## Overview
**Advanced Calculator Express** is an advanced AI-enhanced calculator web application built with **React**, **TypeScript**, and **Tailwind CSS**. It allows users to perform both simple and complex mathematical operations, solve algebraic equations, compute derivatives and integrals, and visualize expressions graphically.

## ✅ Features

### ✔️ Working Functionalities
- **Basic Calculator**: Handles arithmetic operations (`+`, `-`, `×`, `÷`)
- **Advanced Math**: Trigonometric, logarithmic, and exponential functions
- **Equation Solver**: Solves linear, quadratic, and symbolic algebraic equations
- **Derivatives**: Computes symbolic derivatives of mathematical functions
- **Integrals**: Computes symbolic integrals (limited support for simple forms)
- **Graph Visualization**: Visualizes functions with real-time plotting using Plotly.js
- **Expression Input**: Supports direct math expression input
- **Error Handling**: Intelligent parsing and syntax suggestions for invalid input
- **History Tracking**: View past expressions and results
- **Themes**: Dark and light mode toggle
- **Responsive UI**: Fully responsive for desktop and mobile use

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS (with CSS Variables for theming)
- **Math Engine**: Math.js with custom symbolic extensions
- **Graphing**: Plotly.js
- **Build Tool**: Vite
- **Package Manager**: npm (or bun)

### Project Structure
```

neural-calc-express/
├── src/
│   ├── components/
│   │   ├── Calculator.tsx          # Main calculator UI logic
│   │   ├── GraphPlotter.tsx        # Real-time plotting of functions
│   │   ├── HistoryView\.tsx         # History tab
│   │   └── ui/                     # Tailored UI components
│   ├── lib/
│   │   └── calculatorEngine.ts     # Core math logic: parsing, evaluation, AI logic
│   ├── hooks/                      # Custom hooks
│   ├── pages/                      # Tabbed layout & views
│   └── utils/                      # Optional: helpers
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts

````

## 🧠 Core Logic: `calculatorEngine.ts`

This engine handles the intelligence behind all math logic:

```ts
evaluate(expression: string): CalculationResult
solveEquation(equation: string): CalculationResult
differentiate(expr: string, variable?: string): CalculationResult
integrate(expr: string, variable?: string): CalculationResult
plotExpression(expr: string): PlotData
getHistory(): string[]
clearHistory(): void
````

All expressions are parsed via `math.js`, then custom logic is used for:

* Auto-simplification
* Symbolic derivation and integration
* Equation balancing and root finding

## 🖥️ UI Components

### Calculator.tsx

Main interface component providing tabbed views for:

* **Calculator**: Math pad + expression evaluation
* **Graph**: Visualizes math expressions in 2D
* **History**: Recap of previously evaluated expressions

### GraphPlotter.tsx

Uses Plotly.js to visualize algebraic and trigonometric functions. Supports multiple plots.

## 🔧 Setup Instructions

### Prerequisites

* Node.js v18+
* npm (or bun)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/neural-calc-express

# Navigate into the project
cd neural-calc-express

# Install dependencies
npm install
# OR
bun install

# Fix buffer issue if any
npm install buffer

# Run dev server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📊 Testing Strategy

### Recommended Tests

* Symbolic expression evaluation
* Derivative edge cases (`x^x`, `sin(x^2)`)
* Integration of polynomials, exponential/logarithmic terms
* Invalid syntax cases
* History stack behavior

### Testing Tools (Future)

* **Jest** + **React Testing Library**
* CI/CD setup via GitHub Actions

## 🧭 Example Usage

### Solve Equation

Input:

```
3*x + 2*sin(x) = 5
```

Output:

```
x = -1.6666666666666667
```

### Derivative

Input:

```
derivative(x^2 + 2*x, x)
```

Output:

```
2 * (x + 1)
```

### Integration

Input:

```
integral(x^2 + 2*x, x, 0, 3)
```

Output:

```
18.0000045
```

Output:
Graph rendered in the "Graph" tab

## 🧱 Known Issues

* Complex symbolic integrals beyond polynomials may not resolve
* No backend storage for history (yet)
* No persistent state (refresh clears history)

### Planned Features

* 🔐 Authentication + cloud sync
* 🎤 Voice input (speech-to-math)
* 🧮 Unit conversion
* 🧠 AI tutor hints for expressions
* 📱 PWA + mobile app build
* 📄 Export results as PDF

### Technical Improvements

* Zustand or Redux for state management
* Modular plugin architecture (e.g., plug in equation solvers)
* WebAssembly-based math engines (e.g., SymPy via Pyodide)

## 📞 Support

If you encounter issues or have feature requests, open a GitHub issue or contact the dev team at `support@neuralcalc.app`.

---

**Last Updated**: August 2025
**Version**: 1.1.0
**Status**: Actively Developed 🚧
