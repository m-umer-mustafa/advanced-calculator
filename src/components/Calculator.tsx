import React, { useState, useEffect, useRef } from 'react';
import { CalculatorButton } from './CalculatorButton';
import { CalculatorDisplay } from './CalculatorDisplay';
import { GraphPlotter } from './GraphPlotter';
import { ThemeToggle } from './ThemeToggle';
import { CalculatorEngine, CalculationResult } from '@/lib/calculatorEngine';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Calculator as CalcIcon, TrendingUp } from 'lucide-react';

export const Calculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<CalculationResult>({ result: '0' });
  const [history, setHistory] = useState<string[]>([]);
  const [engine] = useState(new CalculatorEngine());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      calculateResult();
    } else if (value === 'C') {
      clear();
    } else if (value === '⌫') {
      setExpression(prev => prev.slice(0, -1));
    } else if (value === 'π' || value === 'e') {
      setExpression(prev => prev + value);
    } else if (['sin', 'cos', 'tan', 'log', 'sqrt'].includes(value)) {
      const currentPos = inputRef.current?.selectionStart || expression.length;
      const newExpression = expression.slice(0, currentPos) + value + '()' + expression.slice(currentPos);
      setExpression(newExpression);

      setTimeout(() => {
        if (inputRef.current) {
          const newPos = currentPos + value.length + 1;
          inputRef.current.setSelectionRange(newPos, newPos);
          inputRef.current.focus();
        }
      }, 0);
    } else if (value === 'Derivative') {
      // Use function call syntax for derivative
      setExpression(`derivative(${expression || 'x'}, x)`);
      setTimeout(calculateResult, 0);
    } else if (value === 'Integral') {
      // Use function call syntax for integral
      setExpression(`integral(${expression || 'x'}, x)`);
      setTimeout(calculateResult, 0);
    } else if (['deg', 'rad'].includes(value)) {
      setExpression(`${value}(${expression})`);
      setTimeout(calculateResult, 0);
    } else if (value === 'mod') {
      setExpression(prev => prev + ' mod()');
    }
 else {
      setExpression(prev => prev + value);
    }
  };

  const calculateResult = () => {
    if (!expression.trim()) return;

    const calculationResult = engine.evaluate(expression);
    setResult(calculationResult);

    if (!calculationResult.error) {
      setHistory(prevHistory => [...prevHistory, `${expression} = ${calculationResult.result}`]);
    }
  };

  const clear = () => {
    setExpression('');
    setResult({ result: '0' });
  };

  const clearHistory = () => {
    engine.clearHistory();
    setHistory([]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (expression && !expression.includes('=')) {
        try {
          const previewResult = engine.evaluate(expression);
          if (!previewResult.error) {
            setResult(previewResult);
          }
        } catch {
          // Ignore preview errors
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [expression, engine]);

  const canGraph = expression.includes('x') && !expression.includes('=') && !expression.includes('derivative(') && !expression.includes('integral(');

  const basicButtons = [
    ['C', '⌫', '(', ')'],
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+']
  ];

  const advancedButtons = [
    ['sin', 'cos', 'tan', 'log'],
    ['sqrt', '^', 'π', 'e'],
    ['x', 'y', '=', 'mod'],
    'Derivative', 'Integral',
    'deg', 'rad'
  ];

  return (
    <div className="min-h-screen bg-gradient-calculator p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1 space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Advanced Calculator
            </h1>
            <p className="text-muted-foreground">
              Solve equations and plot graphs
            </p>
          </div>
          {/* <ThemeToggle /> */}
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-calculator-button">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <CalcIcon size={18} />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-2">
              <TrendingUp size={18} />
              Graph
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History size={18} />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-calculator-bg border-calculator-button space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Expression</label>
                  <Input
                    ref={inputRef}
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="Enter mathematical expression..."
                    className="text-lg font-mono bg-calculator-display border-calculator-button text-calculator-number"
                    onKeyPress={(e) => e.key === 'Enter' && calculateResult()}
                  />
                </div>

                <CalculatorDisplay
                  expression={expression}
                  result={result.result}
                  error={result.error}
                  suggestion={result.suggestion}
                />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Basic Operations</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {basicButtons.flat().map((btn, idx) => (
                      <CalculatorButton
                        key={idx}
                        onClick={() => handleButtonClick(btn)}
                        variant={
                          btn === '=' ? 'equals' :
                            ['+', '-', '*', '/', '(', ')'].includes(btn) ? 'operator' :
                              ['C', '⌫'].includes(btn) ? 'function' : 'number'
                        }
                      >
                        {btn}
                      </CalculatorButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Advanced Functions</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {advancedButtons.flat().map((btn, idx) => (
                      <CalculatorButton
                        key={idx}
                        onClick={() => handleButtonClick(btn)}
                        variant="function"
                      >
                        {btn}
                      </CalculatorButton>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-calculator-bg border-calculator-button space-y-4">
                {result.steps && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Solution Steps:</h4>
                    <div className="space-y-1">
                      {result.steps.map((step, idx) => (
                        <div key={idx} className="text-sm bg-calculator-display p-2 rounded font-mono text-calculator-number">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canGraph && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Quick Preview</h4>
                    <div className="h-48">
                      <GraphPlotter
                        expression={expression}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Try These Examples:</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {[
                      'x^2 + 3*x - 4 = 0',
                      '2*(3+5)',
                      'sin(pi',
                      'sqrt(16)',
                      'deg(180)',
                      'rad(3.14)',
                      'mod(10, 3)',
                      'sin(deg(30))',
                      'cos(rad(3.14))',
                      'x^2 - 5*x + 6=0',
                      '3*x + 2*sin(x) = 5',
                      'x^2 + 2*i*x + 1 = 0',
                      'derivative(x^2 + 2*x, x)',
                      'integral(x^2 + 2*x, x, 0, 3)'

                    ].map((example, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpression(example)}
                        className="justify-start text-xs h-8 text-muted-foreground hover:text-foreground"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="graph">
            <Card className="p-6 bg-calculator-bg border-calculator-button">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Function Plotter</h3>
                  <div className="flex gap-2">
                    <Input
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      placeholder="Enter function (e.g. x^2, sin(x))"
                      className="w-64 bg-calculator-display text-calculator-number"
                    />
                  </div>
                </div>
                <div className="h-96">
                  <GraphPlotter
                    expression={expression}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6 bg-calculator-bg border-calculator-button">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Calculation History</h3>
                  <Button
                    variant="outline"
                    onClick={clearHistory}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    Clear History
                  </Button>
                </div>

                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No calculations yet. Start calculating to see history here.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.slice().reverse().map((calc, idx) => (
                      <div
                        key={idx}
                        className="bg-calculator-display p-3 rounded font-mono text-sm hover:bg-calculator-button cursor-pointer text-calculator-number"
                        onClick={() => setExpression(calc.split(' = ')[0])}
                      >
                        {calc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Calculator;
