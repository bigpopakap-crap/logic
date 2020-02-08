interface Expression {
  evaluate: () => boolean;
  description: object | string | boolean;
}

function val(v: boolean, description = String(v)): Expression {
  return {
    evaluate(): boolean {
      return v;
    },
    description: `(${description})`,
  };
}

function func(f: () => boolean, description = '(function)'): Expression {
  return {
    evaluate(): boolean {
      return f();
    },
    description: `(${description})`,
  };
}

// TODO add an option to short-circuit or not
function and(...exprs: Expression[]): Expression {
  return {
    evaluate(): boolean {
      return exprs
        .map(expr => expr.evaluate())
        .reduce((totalResult, curResult) => {
          return totalResult && curResult;
        }, true);
    },
    description: {
      and: exprs.map(expr => expr.description),
    },
  };
}

// TODO add an option to short-circuit or not
function or(...exprs: Expression[]): Expression {
  return {
    evaluate(): boolean {
      return exprs
        .map(expr => expr.evaluate())
        .reduce((totalResult, curResult) => {
          return totalResult || curResult;
        }, true);
    },
    description: {
      or: exprs.map(expr => expr.description),
    },
  };
}

function not(expr: Expression): Expression {
  return {
    evaluate(): boolean {
      return !expr.evaluate();
    },
    description: {
      not: expr.description,
    },
  };
}

function count(exprs: Expression[], handleCounts: ({ numFalse, numTrue }: { numFalse: number, numTrue: number}) => boolean, goalDescription = 'function'): Expression {
  return {
    evaluate(): boolean {
      return handleCounts(
          exprs
            .map(expr => expr.evaluate())
            .reduce(
                ({ numFalse, numTrue }, curResult: boolean) => {
                    return curResult ? { numFalse, numTrue: numTrue + 1 } : { numFalse: numFalse + 1, numTrue };
                },
                { numFalse: 0, numTrue: 0 }
            )
      );
    },
    description: {
      exactly: exprs.map(expr => expr.description),
      goalDescription
    },
  };
}

function exactlyTrue(exprs: Expression[], goalNumTrue: number): Expression {
    return count(exprs, ({ numTrue }) => numTrue === goalNumTrue);
}

function exactlyFalse(exprs: Expression[], goalNumFalse: number): Expression {
    return count(exprs, ({ numFalse }) => numFalse === goalNumFalse);
}

function atLeastTrue(exprs: Expression[], goalNumTrue: number): Expression {
    return count(exprs, ({ numTrue }) => numTrue >= goalNumTrue);
}

function atLeastFalse(exprs: Expression[], goalNumFalse: number): Expression {
    return count(exprs, ({ numFalse }) => numFalse >= goalNumFalse);
}

function moreTrueThanFalse(exprs: Expression[]): Expression {
    return count(exprs, ({ numFalse, numTrue }) => numTrue > numFalse);
}

function moreFalseThanTrue(exprs: Expression[]): Expression {
    return count(exprs, ({ numFalse, numTrue }) => numFalse > numTrue);
}

function atLeastAsTrueAsFalse(exprs: Expression[]): Expression {
    return not(moreFalseThanTrue(exprs));
}

function atLeastAsFalseAsTrue(exprs: Expression[]): Expression {
    return not(moreTrueThanFalse(exprs));
}

function xor(exprs: Expression[]): Expression {
  return exactlyTrue(exprs, 1);
}

function nor(first: Expression, second: Expression): Expression {
  return not(or(first, second));
}

function nand(first: Expression, second: Expression): Expression {
  return not(and(first, second));
}

/* HERE IS AN EXAMPLE ************************************************************ */
(() => {
  const A = true;
  const B = false;
  const C = false;
  const D = false; // change this to true/false to see the result change

  const exampleExpr = and(
    or(
      val(A, `A = ${A}`),
      func(() => B, `function returns B = ${B}`)
    ),
    not(and(val(C, `C = ${C}`), val(D, `D = ${D}`))),
    not(val(D, `D = ${D}`))
  );

  document.write(`
    <div>
      A = ${A}</br>
      B = ${B}</br>
      C = ${C}</br>
      D = ${D}</br>
    </div>
    <pre>${JSON.stringify(exampleExpr.description, undefined, 2)}</pre>
    <div>
      result = ${exampleExpr.evaluate()}
    </div>
  `);
})();
