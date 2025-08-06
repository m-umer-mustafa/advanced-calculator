import { evaluate, derivative as mathDerivative } from 'mathjs';

export interface CalculationResult {
  result: string;
  error?: string;
  suggestion?: string;
  steps?: string[];
  isEquation?: boolean;
  roots?: (number | string)[];
}

export class CalculatorEngine {
  private history: string[] = [];
  private degreeMode: boolean = false;

  evaluate(expression: string): CalculationResult {
    try {
      const cleaned = this.cleanExpression(expression);

      if (cleaned.startsWith('derivative(') && cleaned.endsWith(')')) {
        const args = cleaned.slice(11, -1).split(',');
        if (args.length !== 2) throw new Error('Invalid derivative syntax. Use derivative(expression, variable)');
        const [expr, variable] = args;
        return this.calculateDerivative(expr.trim(), variable.trim());
      }

      if (cleaned.startsWith('integral(') && cleaned.endsWith(')')) {
        const args = cleaned.slice(9, -1).split(',');
        if (args.length < 2 || args.length > 4)
          throw new Error('Invalid integral syntax. Use integral(expression, variable, a?, b?)');
        const expr = args[0].trim();
        const variable = args[1].trim();
        const a = args.length >= 3 ? parseFloat(args[2]) : undefined;
        const b = args.length === 4 ? parseFloat(args[3]) : undefined;
        return this.calculateIntegral(expr, variable, a, b);
      }

      if (cleaned.includes('=') && cleaned.includes('x')) {
        return this.solveEquation(cleaned);
      }

      const suggestion = this.generateSuggestion(cleaned);

      let result = evaluate(cleaned);

      if (this.degreeMode && cleaned.includes('deg')) {
        result = evaluate(cleaned.replace('deg', 'rad'));
      }
      this.history.push(`${cleaned} = ${result}`);

      return {
        result: this.formatResult(result),
        suggestion
      };
    } catch (error) {
      return this.handleError(expression, error as Error);
    }
  }

  setDegreeMode(mode: boolean) {
    this.degreeMode = mode;
  }

  private calculateDerivative(expression: string, variable: string): CalculationResult {
    try {
      const derivativeResult = mathDerivative(expression, variable);
      return {
        result: derivativeResult.toString()
      };
    } catch (error) {
      return this.handleError(expression, error as Error);
    }
  }

  private calculateIntegral(expression: string, variable: string, a?: number, b?: number): CalculationResult {
    if (a === undefined || b === undefined) {
      return {
        result: '',
        error: 'Integration limits are required. Use integral(expression, variable, a, b)',
        suggestion: 'Example: integral(x^2, x, 0, 1)'
      };
    }
    if (isNaN(a) || isNaN(b)) {
      return {
        result: '',
        error: 'Invalid integration limits. Please provide numeric values for a and b.',
      };
    }
    try {
      // Trapezoidal Rule for numerical integration
      const n = 1000; // number of subintervals
      const h = (b - a) / n;

      const f = (x: number) => evaluate(expression, { [variable]: x });

      let sum = 0.5 * (f(a) + f(b));
      for (let i = 1; i < n; i++) {
        sum += f(a + i * h);
      }

      const integralValue = sum * h;

      return {
        result: this.formatResult(integralValue),
        suggestion: `Numerical integration of ∫ from ${a} to ${b} with ${n} subdivisions`
      };
    } catch (error) {
      return this.handleError(expression, error as Error);
    }
  }

  private solveEquation(equation: string): CalculationResult {
    try {
      const [left, right] = equation.split('=');
      const normalizedEq = `${left.trim()} - (${right.trim()})`;

      const roots = this.findRoots(normalizedEq);

      if (roots.length > 0) {
        return {
          result: `x = ${roots.join(', ')}`,
          isEquation: true,
          roots,
          steps: this.generateSolutionSteps(equation, roots)
        };
      }

      return {
        result: "Unable to solve",
        error: "Complex equation - try simpler expressions",
        suggestion: "Try linear equations like '2x + 3 = 7' or quadratic like 'x^2 - 5x + 6 = 0'"
      };
    } catch (error) {
      return this.handleError(equation, error as Error);
    }
  }

  private findRoots(expression: string): (number | string)[] {
    try {
      if (this.isLinear(expression)) {
        return this.solveLinear(expression);
      }

      if (this.isQuadratic(expression)) {
        return this.solveQuadratic(expression);
      }

      return [];
    } catch {
      return [];
    }
  }

  private isLinear(expr: string): boolean {
    return expr.includes('x') && !expr.includes('x^2') && !expr.includes('x*x');
  }

  private isQuadratic(expr: string): boolean {
    return expr.includes('x^2') || expr.includes('x*x');
  }

  private solveLinear(expr: string): number[] {
    try {
      const xCoeffMatch = expr.match(/(-?\d*\.?\d*)\s*\*?\s*x/);
      const constMatch = expr.match(/(-?\d+\.?\d*)[^x]*$/);

      let a = 1;
      let b = 0;

      if (xCoeffMatch) {
        a = xCoeffMatch[1] === '' || xCoeffMatch[1] === '+' ? 1 :
          xCoeffMatch[1] === '-' ? -1 : parseFloat(xCoeffMatch[1]);
      }

      if (constMatch) {
        b = parseFloat(constMatch[1]);
      }

      if (a === 0) return [];

      return [-b / a];
    } catch {
      return [];
    }
  }

  private solveQuadratic(expr: string): (number | string)[] {
    try {
      const x2Match = expr.match(/(-?\d*\.?\d*)\s*\*?\s*x\^?2/);
      const xMatch = expr.match(/(-?\d*\.?\d*)\s*\*?\s*x(?!\^)/);
      const constMatch = expr.match(/(-?\d+\.?\d*)(?![x\^])/);

      let a = 0, b = 0, c = 0;

      if (x2Match) {
        a = x2Match[1] === '' || x2Match[1] === '+' ? 1 :
          x2Match[1] === '-' ? -1 : parseFloat(x2Match[1]);
      }

      if (xMatch) {
        b = xMatch[1] === '' || xMatch[1] === '+' ? 1 :
          xMatch[1] === '-' ? -1 : parseFloat(xMatch[1]);
      }

      if (constMatch) {
        c = parseFloat(constMatch[1]);
      }

      if (a === 0) return this.solveLinear(expr);

      const discriminant = b * b - 4 * a * c;

      if (discriminant < 0) {
        const sqrtDiscriminant = Math.sqrt(-discriminant);
        return [
          `(${-b / (2 * a)} + ${sqrtDiscriminant / (2 * a)}i)`,
          `(${-b / (2 * a)} - ${sqrtDiscriminant / (2 * a)}i)`
        ];
      }
      if (discriminant === 0) return [-b / (2 * a)]; // One root

      const sqrt = Math.sqrt(discriminant);
      return [
        (-b + sqrt) / (2 * a),
        (-b - sqrt) / (2 * a)
      ];
    } catch {
      return [];
    }
  }

  private generateSolutionSteps(equation: string, roots: (number | string)[]): string[] {
    const steps = [`Original equation: ${equation}`];

    if (roots.length === 1) {
      steps.push(`Linear equation solution: x = ${roots[0]}`);
    } else if (roots.length === 2) {
      steps.push(`Quadratic equation with two solutions:`);
      steps.push(`x₁ = ${roots[0]}`);
      steps.push(`x₂ = ${roots[1]}`);
    }

    return steps;
  }

  private cleanExpression(expr: string): string {
  return expr
    .replace(/\s/g, '') // Remove spaces
    .replace(/×/g, '*') // Replace × with *
    .replace(/÷/g, '/') // Replace ÷ with /
    .replace(/(\d)([a-zA-Z])/g, '$1*$2') // Add * between number and variable
    .replace(/([a-zA-Z])(\d)/g, '$1*$2') // Add * between variable and number
    .replace(/\)\(/g, ')*(') // Add * between parentheses
    .replace(/deg\(([^)]+)\)/g, '($1 * pi / 180)') // Convert deg() to radians
    .replace(/rad\(([^)]+)\)/g, '($1 * 180 / pi)') // Convert rad() to degrees
    .toLowerCase();
}


  private formatResult(result: any): string {
    if (typeof result === 'number') {
      if (Math.abs(result - Math.round(result)) < 1e-10) {
        return Math.round(result).toString();
      }
      return result.toFixed(8).replace(/\.?0+$/, '');
    }
    return result.toString();
  }

  private generateSuggestion(expr: string): string | undefined {
    if (expr.includes('x') && !expr.includes('=')) {
      return "Add '= 0' to solve for x, or '= y' to define a function";
    }

    if (expr.includes('^') && expr.includes('x')) {
      return "Try graphing this function to visualize the curve";
    }

    if (expr.match(/sin|cos|tan/)) {
      return "Trigonometric functions use radians. Use deg() for degrees";
    }

    if (expr.includes('sqrt') || expr.includes('^0.5')) {
      return "Remember: √(x²) = |x| for real numbers";
    }

    return undefined;
  }

  private handleError(expression: string, error: Error): CalculationResult {
    let suggestion = "Check your syntax and try again";
    let errorType = "Syntax Error";

    const openBrackets = (expression.match(/\(/g) || []).length;
    const closeBrackets = (expression.match(/\)/g) || []).length;

    if (openBrackets !== closeBrackets) {
      const diff = openBrackets - closeBrackets;
      return {
        result: "",
        error: "Unbalanced parentheses",
        suggestion: diff > 0
          ? `Missing ${diff} closing bracket${diff > 1 ? 's' : ''} ')'`
          : `Missing ${Math.abs(diff)} opening bracket${Math.abs(diff) > 1 ? 's' : ''} '('`
      };
    }

    if (/\b(sin|cos|tan|log|sqrt)\b(?!\()/.test(expression)) {
      return {
        result: "",
        error: "Functions need parentheses",
        suggestion: "Use sin(x), cos(x), tan(x), log(x), or sqrt(x) with parentheses around the argument"
      };
    }

    if (error.message.includes('Unexpected')) {
      suggestion = "Check for missing operators or parentheses";
    } else if (error.message.includes('undefined')) {
      suggestion = "Unknown function or variable. Try: sin, cos, tan, log, sqrt";
    } else if (expression.includes('/0')) {
      suggestion = "Division by zero is undefined";
    }

    return {
      result: "",
      error: errorType,
      suggestion
    };
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}
