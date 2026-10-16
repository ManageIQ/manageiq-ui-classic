/**
 * Translation catalogs are loaded outside the webpack bundle, so __/n__/s__
 * must not be evaluated at module load time. This spec fails with the list of
 * offending call sites.
 */
import fs from 'fs';
import path from 'path';
// @babel/parser is a dependency of the declared @babel/core; @babel/core itself is ESM-only under Jest.
// eslint-disable-next-line import/no-extraneous-dependencies
import * as parser from '@babel/parser';

const FNS = new Set(['__', 'n__', 's__']);
const SKIP_DIRS = ['spec', 'node_modules', 'locale'];
const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod',
]);
// __dirname is app/javascript/spec/i18n
// eslint-disable-next-line no-undef
const root = path.resolve(__dirname, '../../../..');
const javascriptRoot = path.join(root, 'app/javascript');

// Walk the AST, collecting translation calls that are evaluated at module load.
// Function bodies and instance class properties are deferred, so they are skipped.
const collectCalls = (node, file, results) => {
  if (Array.isArray(node)) {
    node.forEach((child) => collectCalls(child, file, results));
    return;
  }
  if (!node || typeof node.type !== 'string') {
    return;
  }
  if (FUNCTION_TYPES.has(node.type)) {
    return;
  }
  if (node.type === 'ClassProperty' && !node.static) {
    return;
  }
  if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && FNS.has(node.callee.name)) {
    results.push(`${path.relative(root, file)}:${node.loc.start.line}`);
  }
  Object.keys(node).forEach((key) => {
    if (key !== 'loc' && key !== 'leadingComments' && key !== 'trailingComments') {
      collectCalls(node[key], file, results);
    }
  });
};

const findOffenders = (dir, results = []) => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((ent) => {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!SKIP_DIRS.includes(ent.name)) {
        findOffenders(p, results);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(ent.name)) {
      const ast = parser.parse(fs.readFileSync(p, 'utf8'), {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
      });
      collectCalls(ast.program, p, results);
    }
  });
  return results;
};

describe('module-scope translation calls', () => {
  it('does not call __, n__ or s__ at module scope', () => {
    expect(findOffenders(javascriptRoot)).toEqual([]);
  });
});
