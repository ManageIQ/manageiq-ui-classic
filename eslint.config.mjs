import globals from 'globals';
import js from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from '@eslint-react/eslint-plugin';
import importPlugin from 'eslint-plugin-import-x';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

// Shared ManageIQ globals used by both JSX and TypeScript configurations
const sharedManageIQGlobals = {
  // ManageIQ specific globals
  ManageIQ: 'readonly',
  __: 'readonly',
  n__: 'readonly',
  API: 'readonly',
  add_flash: 'writable',
  miqSparkleOn: 'writable',
  miqSparkleOff: 'writable',
  miqCheckForChanges: 'writable',
  miqChangeGroup: 'writable',
  miqAjax: 'writable',
  miqAjaxButton: 'writable',
  miqTreeActivateNode: 'writable',
  miqQueueReport: 'writable',
  sendDataWithRx: 'readonly',
  listenToRx: 'writable',
  vanillaJsAPI: 'readonly',
  sprintf: 'readonly',
  _: 'readonly',
  http: 'readonly',
};

// Shared rules used by both JSX and TypeScript configurations
// Uses @eslint-react/* rule names (ESLint 10-compatible replacement for eslint-plugin-react)
const sharedReactRules = {
  '@eslint-react/no-access-state-in-setstate': 'error',
  '@eslint-react/no-array-index-key': 'error',
  '@eslint-react/jsx-no-children-prop': 'error',
  '@eslint-react/dom-no-dangerously-set-innerhtml': 'warn',
  '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error',
  // Deprecated lifecycle methods (replaces react/no-deprecated)
  '@eslint-react/no-component-will-mount': 'error',
  '@eslint-react/no-component-will-receive-props': 'error',
  '@eslint-react/no-component-will-update': 'error',
  '@eslint-react/no-unsafe-component-will-mount': 'off',
  '@eslint-react/no-set-state-in-component-did-update': 'error',
  '@eslint-react/dom-no-find-dom-node': 'error',
  '@eslint-react/dom-no-render-return-value': 'error',
  '@eslint-react/dom-no-unknown-property': 'error',
  '@eslint-react/no-unused-state': 'error',
  '@eslint-react/no-set-state-in-component-will-update': 'error',
  '@eslint-react/dom-no-void-elements-with-children': 'error',
  '@eslint-react/jsx-no-comment-textnodes': 'error',
  '@eslint-react/dom-no-unsafe-target-blank': 'error',
  '@eslint-react/no-missing-key': 'off',
  '@eslint-react/no-direct-mutation-state': 'off',
};

const sharedReactHooksRules = {
  '@eslint-react/rules-of-hooks': 'error',
  '@eslint-react/exhaustive-deps': 'off',
};

const sharedImportRules = {
  'import/no-unresolved': [
    'error',
    { commonjs: true, caseSensitive: true, ignore: ['^@@ddf'] },
  ],
  'import/named': 'error',
  'import/default': 'off',
  'import/namespace': 'off',
  'import/export': 'error',
  'import/no-named-as-default': 'error',
  'import/no-named-as-default-member': 'error',
  'import/no-deprecated': 'off',
  'import/no-mutable-exports': 'error',
  'import/no-commonjs': 'off',
  'import/no-amd': 'error',
  'import/no-nodejs-modules': 'off',
  'import/first': 'error',
  'import/imports-first': 'off',
  'import/no-duplicates': 'error',
  'import/no-namespace': 'off',
  'import/extensions': [
    'error',
    'ignorePackages',
    { js: 'never', mjs: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
  ],
  'import/order': ['error', { groups: [['builtin', 'external', 'internal']] }],
  'import/newline-after-import': 'error',
  'import/prefer-default-export': 'off',
  'import/no-restricted-paths': 'off',
  'import/max-dependencies': ['off', { max: 10 }],
  'import/no-absolute-path': 'error',
  'import/no-dynamic-require': 'error',
  'import/no-internal-modules': ['off', { allow: [] }],
  'import/unambiguous': 'off',
  'import/no-webpack-loader-syntax': 'error',
  'import/no-unassigned-import': 'off',
  'import/no-named-default': 'error',
  'import/no-anonymous-default-export': [
    'off',
    {
      allowArray: false,
      allowArrowFunction: false,
      allowAnonymousClass: false,
      allowAnonymousFunction: false,
      allowLiteral: false,
      allowObject: false,
    },
  ],
  'import/exports-last': 'off',
  'import/group-exports': 'off',
  'import/no-default-export': 'off',
  'import/no-named-export': 'off',
  'import/no-self-import': 'error',
  'import/no-cycle': ['error', { maxDepth: '∞', ignoreExternal: false }],
  'import/no-useless-path-segments': ['error', { commonjs: true }],
  'import/dynamic-import-chunkname': [
    'off',
    { importFunctions: [], webpackChunknameFormat: '[0-9a-zA-Z-_/.]+' },
  ],
  'import/no-relative-parent-imports': 'off',
  'import/no-unused-modules': [
    'off',
    { ignoreExports: [], missingExports: true, unusedExports: true },
  ],
};

const sharedJsxA11yRules = {
  'jsx-a11y/accessible-emoji': 'off',
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-has-content': ['error', { components: [] }],
  'jsx-a11y/anchor-is-valid': [
    'error',
    {
      components: ['Link'],
      specialLink: ['to'],
      aspects: ['noHref', 'invalidHref', 'preferButton'],
    },
  ],
  'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-role': ['error', { ignoreNonDOM: false }],
  'jsx-a11y/aria-unsupported-elements': 'error',
  'jsx-a11y/autocomplete-valid': ['off', { inputComponents: [] }],
  'jsx-a11y/click-events-have-key-events': 'error',
  'jsx-a11y/control-has-associated-label': [
    'error',
    {
      labelAttributes: ['label'],
      controlComponents: [],
      ignoreElements: [
        'audio',
        'canvas',
        'embed',
        'input',
        'textarea',
        'tr',
        'video',
      ],
      ignoreRoles: [
        'grid',
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'row',
        'tablist',
        'toolbar',
        'tree',
        'treegrid',
      ],
      depth: 5,
    },
  ],
  'jsx-a11y/heading-has-content': ['error', { components: [''] }],
  'jsx-a11y/html-has-lang': 'error',
  'jsx-a11y/iframe-has-title': 'error',
  'jsx-a11y/img-redundant-alt': 'error',
  'jsx-a11y/interactive-supports-focus': 'error',
  'jsx-a11y/label-has-associated-control': [
    'error',
    {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: [],
      assert: 'both',
      depth: 25,
    },
  ],
  'jsx-a11y/label-has-for': 'off',
  'jsx-a11y/media-has-caption': ['error', { audio: [], video: [], track: [] }],
  'jsx-a11y/mouse-events-have-key-events': 'error',
  'jsx-a11y/no-access-key': 'error',
  'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
  'jsx-a11y/no-distracting-elements': [
    'error',
    { elements: ['marquee', 'blink'] },
  ],
  'jsx-a11y/no-interactive-element-to-noninteractive-role': [
    'error',
    { tr: ['none', 'presentation'] },
  ],
  'jsx-a11y/no-noninteractive-element-interactions': [
    'error',
    {
      handlers: [
        'onClick',
        'onMouseDown',
        'onMouseUp',
        'onKeyPress',
        'onKeyDown',
        'onKeyUp',
      ],
    },
  ],
  'jsx-a11y/no-noninteractive-element-to-interactive-role': [
    'error',
    {
      ul: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      ol: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
      table: ['grid'],
      td: ['gridcell'],
    },
  ],
  'jsx-a11y/no-noninteractive-tabindex': [
    'error',
    { tags: [], roles: ['tabpanel'] },
  ],
  'jsx-a11y/no-onchange': 'off',
  'jsx-a11y/no-redundant-roles': 'error',
  'jsx-a11y/no-static-element-interactions': [
    'error',
    {
      handlers: [
        'onClick',
        'onMouseDown',
        'onMouseUp',
        'onKeyPress',
        'onKeyDown',
        'onKeyUp',
      ],
    },
  ],
  'jsx-a11y/role-has-required-aria-props': 'error',
  'jsx-a11y/role-supports-aria-props': 'error',
  'jsx-a11y/scope': 'error',
  'jsx-a11y/tabindex-no-positive': 'error',
};

const sharedJestRules = {
  'jest/no-disabled-tests': 'warn',
  'jest/no-focused-tests': 'error',
  'jest/no-identical-title': 'error',
  'jest/prefer-to-have-length': 'warn',
  'jest/valid-expect': 'error',
};

// Shared Airbnb base rules (code quality + formatting)
// Excludes rules that conflict with TypeScript compiler:
// - no-unused-vars, no-use-before-define, no-undef (TS has its own versions)
// - no-dupe-class-members, no-redeclare, no-duplicate-imports (TS compiler handles these)
const sharedAirbnbBaseRules = {
  // Additional Airbnb best practices rules
  'array-callback-return': ['error', { allowImplicit: true }],
  'block-scoped-var': 'error',
  complexity: ['off', 20],
  'class-methods-use-this': ['error', { exceptMethods: [] }],
  'dot-location': ['error', 'property'],
  'grouped-accessor-pairs': 'error',
  'no-alert': 'warn',
  'no-case-declarations': 'error',
  'no-constructor-return': 'error',
  'no-else-return': ['error', { allowElseIf: false }],
  'no-empty-function': [
    'error',
    { allow: ['arrowFunctions', 'functions', 'methods'] },
  ],
  'no-empty-pattern': 'error',
  'no-eq-null': 'off',
  'no-extra-label': 'error',
  'no-fallthrough': 'error',
  'no-global-assign': ['error', { exceptions: [] }],
  'no-implicit-coercion': [
    'off',
    { boolean: false, number: true, string: true, allow: [] },
  ],
  'no-implicit-globals': 'off',
  'no-invalid-this': 'off',
  'no-iterator': 'error',
  'no-label-var': 'error',
  'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  'no-lone-blocks': 'error',
  'no-multi-assign': ['error'],
  'no-multi-str': 'error',
  'no-new': 'error',
  'no-new-func': 'error',
  'no-new-wrappers': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-octal': 'error',
  'no-octal-escape': 'error',
  'no-plusplus': 'off',
  'no-proto': 'error',
  'no-restricted-properties': [
    'error',
    {
      object: 'arguments',
      property: 'callee',
      message: 'arguments.callee is deprecated',
    },
    {
      object: 'global',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'self',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'window',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'global',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      object: 'self',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      object: 'window',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      property: '__defineGetter__',
      message: 'Please use Object.defineProperty instead.',
    },
    {
      property: '__defineSetter__',
      message: 'Please use Object.defineProperty instead.',
    },
    {
      object: 'Math',
      property: 'pow',
      message: 'Use the exponentiation operator (**) instead.',
    },
  ],
  'no-return-assign': ['error', 'always'],
  'no-return-await': 'error',
  'no-script-url': 'error',
  'no-self-assign': ['error', { props: true }],
  'no-self-compare': 'error',
  'no-sequences': 'error',
  'no-throw-literal': 'error',
  'no-unmodified-loop-condition': 'off',
  'no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
    },
  ],
  'no-unused-labels': 'error',
  'no-useless-call': 'off',
  'no-useless-catch': 'error',
  'no-useless-concat': 'error',
  'no-useless-escape': 'error',
  'no-useless-return': 'error',
  'no-void': 'error',
  'no-warning-comments': [
    'off',
    { terms: ['todo', 'fixme', 'xxx'], location: 'start' },
  ],
  'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
  'prefer-named-capture-group': 'off',
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'require-await': 'off',
  'require-unicode-regexp': 'off',
  'vars-on-top': 'error',
  'wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],
  yoda: 'error',

  // ES6+ specific rules (Airbnb style)
  'arrow-body-style': ['error', 'as-needed'],
  'arrow-parens': ['error', 'always'],
  'arrow-spacing': ['error', { before: true, after: true }],
  'constructor-super': 'error',
  'generator-star-spacing': ['error', { before: false, after: true }],
  'no-class-assign': 'error',
  'no-confusing-arrow': ['error', { allowParens: true }],
  'no-const-assign': 'error',
  'no-new-symbol': 'error',
  'no-restricted-imports': ['off'],
  'no-this-before-super': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-constructor': 'error',
  'no-useless-rename': 'error',
  'no-var': 'error',
  'object-shorthand': ['error', 'always'],
  'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
  'prefer-const': [
    'error',
    { destructuring: 'any', ignoreReadBeforeAssign: true },
  ],
  'prefer-destructuring': [
    'error',
    {
      VariableDeclarator: { array: false, object: true },
      AssignmentExpression: { array: true, object: false },
    },
    { enforceForRenamedProperties: false },
  ],
  'prefer-numeric-literals': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'prefer-template': 'error',
  'require-yield': 'error',
  'rest-spread-spacing': ['error', 'never'],
  'symbol-description': 'error',
  'template-curly-spacing': 'error',
  'yield-star-spacing': ['error', 'after'],

  // Additional style rules from Airbnb base
  'array-bracket-newline': ['off', 'consistent'],
  'array-bracket-spacing': ['error', 'never'],
  'array-element-newline': ['off', { multiline: true, minItems: 3 }],
  'block-spacing': ['error', 'always'],
  'capitalized-comments': ['off', 'never'],
  'computed-property-spacing': ['error', 'never'],
  'consistent-this': 'off',
  'func-call-spacing': ['error', 'never'],
  'func-name-matching': [
    'off',
    'always',
    {
      includeCommonJSModuleExports: false,
      considerPropertyDescriptor: true,
    },
  ],
  'func-style': ['off', 'expression'],
  'function-call-argument-newline': ['off', 'consistent'],
  'function-paren-newline': ['error', 'consistent'],
  'id-denylist': 'off',
  'id-length': 'off',
  'id-match': 'off',
  'jsx-quotes': ['off', 'prefer-double'],
  'line-comment-position': [
    'off',
    { position: 'above', ignorePattern: '', applyDefaultPatterns: true },
  ],
  'lines-around-comment': 'off',
  'lines-between-class-members': [
    'error',
    'always',
    { exceptAfterSingleLine: false },
  ],
  'max-depth': ['off', 4],
  'max-lines': ['off', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': [
    'off',
    { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
  ],
  'max-nested-callbacks': 'off',
  'max-params': ['off', 3],
  'max-statements': ['off', 10],
  'max-statements-per-line': ['off', { max: 1 }],
  'multiline-comment-style': ['off', 'starred-block'],
  'multiline-ternary': ['off', 'never'],
  'new-parens': 'error',
  'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
  'no-bitwise': 'error',
  'no-continue': 'error',
  'no-inline-comments': 'off',
  'no-mixed-operators': [
    'error',
    {
      groups: [
        ['%', '**'],
        ['%', '+'],
        ['%', '-'],
        ['%', '*'],
        ['%', '/'],
        ['/', '*'],
        ['&', '|', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!=='],
        ['&&', '||'],
      ],
      allowSamePrecedence: false,
    },
  ],
  'no-negated-condition': 'off',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ForInStatement',
      message:
        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
    },
    {
      selector: 'ForOfStatement',
      message:
        'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
    },
    {
      selector: 'LabeledStatement',
      message:
        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
    },
  ],
  'no-tabs': 'error',
  'no-ternary': 'off',
  'no-unneeded-ternary': ['error', { defaultAssignment: false }],
  'no-whitespace-before-property': 'error',
  'nonblock-statement-body-position': ['error', 'beside', { overrides: {} }],
  'object-curly-newline': [
    'error',
    {
      ObjectExpression: {
        minProperties: 4,
        multiline: true,
        consistent: true,
      },
      ObjectPattern: {
        minProperties: 4,
        multiline: true,
        consistent: true,
      },
      ImportDeclaration: {
        minProperties: 4,
        multiline: true,
        consistent: true,
      },
      ExportDeclaration: {
        minProperties: 4,
        multiline: true,
        consistent: true,
      },
    },
  ],
  'object-curly-spacing': ['error', 'always'],
  'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
  'operator-assignment': ['error', 'always'],
  'operator-linebreak': ['error', 'before', { overrides: { '=': 'none' } }],
  'padding-line-between-statements': 'off',
  'prefer-exponentiation-operator': 'error',
  'prefer-object-spread': 'error',
  'quote-props': [
    'error',
    'as-needed',
    { keywords: false, unnecessary: true, numbers: false },
  ],
  'sort-keys': ['off', 'asc', { caseSensitive: false, natural: true }],
  'sort-vars': 'off',
  'space-in-parens': ['error', 'never'],
  'switch-colon-spacing': ['error', { after: true, before: false }],
  'template-tag-spacing': ['error', 'never'],
  'unicode-bom': ['error', 'never'],
  'wrap-regex': 'off',

  // General rules
  'no-shadow': 0,
  'no-shadow-restricted-names': 2,
  'no-cond-assign': [2, 'always'],
  'no-console': 1,
  'no-constant-condition': 1,
  'no-dupe-keys': 2,
  'no-duplicate-case': 2,
  'no-empty': 2,
  'no-empty-character-class': 2,
  'no-ex-assign': 2,
  'no-extra-semi': 2,
  'no-func-assign': 2,
  'no-inner-declarations': 2,
  'no-invalid-regexp': 2,
  'no-irregular-whitespace': 2,
  'no-unsafe-negation': 2,
  'no-obj-calls': 2,
  'no-regex-spaces': 2,
  'no-sparse-arrays': 2,
  'no-unreachable': 2,
  'use-isnan': 2,
  'valid-typeof': [
    2,
    {
      requireStringLiterals: true,
    },
  ],
  'dot-notation': [
    2,
    {
      allowKeywords: true,
    },
  ],
  'guard-for-in': 2,
  'no-caller': 2,
  'no-div-regex': 2,
  'no-eval': 2,
  'no-extend-native': 2,
  'no-extra-bind': 2,
  'no-extra-boolean-cast': 'off',
  'no-floating-decimal': 2,
  'no-implied-eval': 2,
  'no-loop-func': 2,
  'no-multi-spaces': 2,
  'no-redeclare': 2,
  'no-undef-init': 2,
  'no-undefined': 0,
  'no-underscore-dangle': 'off',
  'no-with': 2,
  radix: 2,
  'brace-style': [
    2,
    '1tbs',
    {
      allowSingleLine: false,
    },
  ],
  'comma-spacing': [
    2,
    {
      before: false,
      after: true,
    },
  ],
  'comma-style': [2, 'last'],
  'eol-last': 2,
  'key-spacing': [
    2,
    {
      beforeColon: false,
      afterColon: true,
    },
  ],
  'new-cap': [
    2,
    {
      newIsCap: true,
    },
  ],
  'no-array-constructor': 2,
  'no-lonely-if': 1,
  'no-multiple-empty-lines': [
    2,
    {
      max: 2,
    },
  ],
  'no-nested-ternary': 2,
  'no-new-object': 2,
  'no-trailing-spaces': 2,
  'no-extra-parens': [2, 'functions'],
  'one-var': [2, 'never'],
  'padded-blocks': [2, 'never'],
  semi: [2, 'always'],
  'semi-spacing': [
    2,
    {
      before: false,
      after: true,
    },
  ],
  'keyword-spacing': 2,
  'space-before-blocks': 2,
  'space-before-function-paren': [2, 'never'],
  'space-infix-ops': 2,
  'spaced-comment': [
    2,
    'always',
    {
      exceptions: ['-', '+'],
      markers: ['=', '!'],
    },
  ],
  'implicit-arrow-linebreak': 'off',
  indent: [
    'error',
    2,
    {
      SwitchCase: 1,
      VariableDeclarator: 1,
    },
  ],
  'consistent-return': 1,
  'default-case': 1,
  'linebreak-style': ['error', 'unix'],
  'max-len': [
    'error',
    {
      code: 150,
      ignoreComments: true,
    },
  ],
  'comma-dangle': [
    'warn',
    {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'only-multiline',
    },
  ],
  'space-unary-ops': [
    'error',
    {
      words: true,
      nonwords: false,
      overrides: {
        '!': false,
      },
    },
  ],
  'no-debugger': 2,
  eqeqeq: ['error', 'smart'],
  quotes: [
    'warn',
    'single',
    {
      avoidEscape: true,
      allowTemplateLiterals: true,
    },
  ],
  'func-names': 0,
  'no-mixed-spaces-and-tabs': 2,
  camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],
  curly: ['warn', 'all'],
  'no-param-reassign': [
    'warn',
    {
      props: false,
    },
  ],
};

export default [
  // ESLint recommended rules (similar to airbnb base)
  js.configs.recommended,
  {
    ignores: [
      // autogenerated translations
      'app/assets/javascripts/locale/**/*.js',
      // not ours or already processed or not javascript
      'node_modules/',
      'public/',
      'tmp/',
      'db/',
      'coverage/',
      // Yarn release files
      '.yarn/',
      // ESLint config itself (ESM, not subject to project lint rules)
      'eslint.config.mjs',
    ],
  },
  {
    // Config files (Node.js CJS environment)
    files: [
      '.babelrc.js',
      'jest.config.js',
      'cypress.config.js',
      'config/webpack/**/*.js',
    ],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-console': 0,
      'import/no-dynamic-require': 0,
    },
  },
  {
    // Jest setup file (ESM with Node.js globals)
    files: ['config/jest.setup.js'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        window: 'writable',
        document: 'readonly',
        global: 'readonly',
        ...sharedManageIQGlobals,
      },
    },
    rules: {
      'no-console': 0,
    },
  },
  {
    // Cypress test files
    files: ['cypress/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Cypress globals
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        context: 'readonly',
        it: 'readonly',
        specify: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        // Browser environment
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 0,
      'no-unused-expressions': 0,
      'no-trailing-spaces': 2,
      semi: [2, 'always'],
      'semi-spacing': [
        2,
        {
          before: false,
          after: true,
        },
      ],
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      'comma-dangle': [
        'warn',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'only-multiline',
        },
      ],
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
        },
      ],
      'eol-last': 2,
      'no-multiple-empty-lines': [
        2,
        {
          max: 2,
        },
      ],
      'space-before-blocks': 2,
      'keyword-spacing': 2,
      'comma-spacing': [
        2,
        {
          before: false,
          after: true,
        },
      ],
    },
  },
  {
    // Modern JavaScript/JSX files (ES6+) - app/javascript
    files: ['app/javascript/**/*.js', 'app/javascript/**/*.jsx'],
    plugins: {
      jest: jestPlugin,
      '@eslint-react': reactPlugin,
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser environment
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        // Jest
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // jQuery
        $: 'readonly',
        jQuery: 'readonly',
        // Shared ManageIQ globals
        ...sharedManageIQGlobals,
        // JS-specific globals
        Promise: 'readonly',
        angular: 'readonly',
        c3: 'readonly',
        d3: 'readonly',
        i18n: 'readonly',
        moment: 'readonly',
        numeral: 'readonly',
        miq_bootstrap: 'writable',
        GitImport: 'writable',
      },
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          tryExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      },
    },
    rules: {
      // Shared rules from constants
      ...sharedJestRules,
      ...sharedReactRules,
      ...sharedReactHooksRules,
      ...sharedImportRules,

      // JSX-specific import rule override
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'test/**',
            'tests/**',
            'spec/**',
            '**/__tests__/**',
            '**/__mocks__/**',
            'test.{js,jsx}',
            'test-*.{js,jsx}',
            '**/*{.,_}{test,spec}.{js,jsx}',
            '**/jest.config.js',
            '**/jest.setup.js',
            '**/vue.config.js',
            '**/webpack.config.js',
            '**/webpack.config.*.js',
            '**/rollup.config.js',
            '**/rollup.config.*.js',
            '**/gulpfile.js',
            '**/gulpfile.*.js',
            '**/Gruntfile{,.js}',
            '**/protractor.conf.js',
            '**/protractor.conf.*.js',
            '**/karma.conf.js',
            '**/.eslintrc.js',
          ],
          optionalDependencies: false,
        },
      ],

      ...sharedJsxA11yRules,
      ...sharedAirbnbBaseRules,

      // JSX-specific overrides for rules that conflict with shared base
      'no-dupe-class-members': 'error',
      'no-duplicate-imports': 'error',
      'no-redeclare': 2,
      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          vars: 'local',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-undef': [
        'warn',
        {
          typeof: true,
        },
      ],
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
        },
      ],
    },
  },
  {
    // Legacy JavaScript files - everything else
    files: ['**/*.js'],
    ignores: [
      'app/javascript/**/*.js',
      '.babelrc.js',
      'jest.config.js',
      'config/jest.setup.js',
      'cypress.config.js',
      'config/webpack/**/*.js',
      'cypress/**/*.js',
      '.yarn/**',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        // Browser environment
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // jQuery
        $: 'readonly',
        jQuery: 'readonly',
        // Local globals
        sendDataWithRx: 'readonly',
        listenToRx: 'writable',
        vanillaJsAPI: 'readonly',
        API: 'readonly',
        ManageIQ: 'readonly',
        Promise: 'readonly',
        _: 'readonly',
        __: 'readonly',
        angular: 'readonly',
        c3: 'readonly',
        d3: 'readonly',
        http: 'readonly',
        i18n: 'readonly',
        moment: 'readonly',
        numeral: 'readonly',
        sprintf: 'readonly',
        add_flash: 'writable',
        miq_bootstrap: 'writable',
      },
    },
    rules: {
      strict: 0,
      'no-shadow': 0,
      'no-shadow-restricted-names': 2,
      'no-cond-assign': [2, 'always'],
      'no-console': 1,
      'no-constant-condition': 1,
      'no-dupe-keys': 2,
      'no-duplicate-case': 2,
      'no-empty': 2,
      'no-empty-character-class': 2,
      'no-ex-assign': 2,
      'no-extra-semi': 2,
      'no-func-assign': 2,
      'no-inner-declarations': 2,
      'no-invalid-regexp': 2,
      'no-irregular-whitespace': 2,
      'no-unsafe-negation': 2,
      'no-new-require': 2,
      'no-obj-calls': 2,
      'no-path-concat': 2,
      'no-regex-spaces': 2,
      'no-sparse-arrays': 2,
      'no-unreachable': 2,
      'use-isnan': 2,
      'valid-typeof': [
        2,
        {
          requireStringLiterals: true,
        },
      ],
      'dot-notation': [
        2,
        {
          allowKeywords: true,
        },
      ],
      'guard-for-in': 2,
      'no-caller': 2,
      'no-div-regex': 2,
      'no-labels': 2,
      'no-eval': 2,
      'no-extend-native': 2,
      'no-extra-bind': 2,
      'no-floating-decimal': 2,
      'no-implied-eval': 2,
      'no-lone-blocks': 2,
      'no-loop-func': 2,
      'no-multi-str': 2,
      'no-global-assign': 2,
      'no-new': 2,
      'no-new-func': 2,
      'no-new-wrappers': 2,
      'no-octal': 2,
      'no-octal-escape': 2,
      'no-process-exit': 2,
      'no-proto': 2,
      'no-redeclare': 2,
      'no-return-assign': 2,
      'no-script-url': 2,
      'no-self-compare': 2,
      'no-sequences': 2,
      'no-throw-literal': 2,
      'no-undef-init': 2,
      'no-undefined': 1,
      'no-with': 2,
      'handle-callback-err': 1,
      radix: 2,
      'wrap-iife': [2, 'any'],
      yoda: 2,
      'brace-style': [
        2,
        '1tbs',
        {
          allowSingleLine: false,
        },
      ],
      'comma-spacing': [
        2,
        {
          before: false,
          after: true,
        },
      ],
      'comma-style': [2, 'last'],
      'eol-last': 2,
      'key-spacing': [
        2,
        {
          beforeColon: false,
          afterColon: true,
        },
      ],
      'new-cap': [
        2,
        {
          newIsCap: true,
        },
      ],
      'new-parens': 2,
      'no-array-constructor': 2,
      'no-lonely-if': 1,
      'no-multiple-empty-lines': [
        2,
        {
          max: 2,
        },
      ],
      'no-nested-ternary': 2,
      'no-new-object': 2,
      'no-trailing-spaces': 2,
      'no-extra-parens': [2, 'functions'],
      'one-var': [2, 'never'],
      'padded-blocks': [2, 'never'],
      semi: [2, 'always'],
      'semi-spacing': [
        2,
        {
          before: false,
          after: true,
        },
      ],
      'keyword-spacing': 2,
      'space-before-blocks': 2,
      'space-before-function-paren': [2, 'never'],
      'space-infix-ops': 2,
      'spaced-comment': [
        2,
        'always',
        {
          exceptions: ['-', '+'],
          markers: ['=', '!'],
        },
      ],
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
        },
      ],
      'consistent-return': 1,
      'default-case': 1,
      'vars-on-top': 0,
      'no-var': 0,
      'linebreak-style': ['error', 'unix'],
      'comma-dangle': [
        'warn',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'only-multiline',
        },
      ],
      'space-unary-ops': [
        'error',
        {
          words: true,
          nonwords: false,
          overrides: {
            '!': false,
          },
        },
      ],
      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          vars: 'local',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-alert': 2,
      'no-debugger': 2,
      'no-else-return': 1,
      'no-undef': [
        'warn',
        {
          typeof: true,
        },
      ],
      eqeqeq: ['error', 'smart'],
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      'func-names': 0,
      'no-mixed-spaces-and-tabs': 2,
      camelcase: 0,
      curly: ['warn', 'all'],
      'no-eq-null': 0,
      'no-param-reassign': [
        'warn',
        {
          props: false,
        },
      ],
      'no-fallthrough': [
        'error',
        {
          commentPattern: 'fall.*through|pass',
        },
      ],
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
        },
      ],
    },
  },

  // TypeScript-specific configuration
  {
    files: ['app/javascript/**/*.ts', 'app/javascript/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
        // Shared ManageIQ globals
        ...sharedManageIQGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@eslint-react': reactPlugin,
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
      jest: jestPlugin,
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          tryExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      },
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Shared rules from constants
      ...sharedReactRules,
      ...sharedReactHooksRules,
      ...sharedImportRules,
      ...sharedJsxA11yRules,
      ...sharedAirbnbBaseRules,
      ...sharedJestRules,

      // TypeScript-specific import rule override
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'test/**',
            'tests/**',
            'spec/**',
            '**/__tests__/**',
            '**/__mocks__/**',
            'test.{ts,tsx}',
            'test-*.{ts,tsx}',
            '**/*{.,_}{test,spec}.{ts,tsx}',
            '**/jest.config.js',
            '**/jest.setup.js',
            '**/vue.config.js',
            '**/webpack.config.js',
            '**/webpack.config.*.js',
            '**/rollup.config.js',
            '**/rollup.config.*.js',
            '**/gulpfile.js',
            '**/gulpfile.*.js',
            '**/Gruntfile{,.js}',
            '**/protractor.conf.js',
            '**/protractor.conf.*.js',
            '**/karma.conf.js',
            '**/.eslintrc.js',
          ],
          optionalDependencies: false,
        },
      ],

      // Extend no-restricted-syntax to add TypeScript-specific restrictions
      'no-restricted-syntax': [
        ...sharedAirbnbBaseRules['no-restricted-syntax'],
        {
          // Catches explicit type assertions like "data as unknown" or "<unknown>data"
          selector: "TSAsExpression[typeAnnotation.type='TSUnknownKeyword']",
          message:
            "Avoid casting values directly to 'unknown'. Use a type guard or an explicit schema validation instead.",
        },
        {
          // Catches explicit variable/property type annotations like "data: unknown"
          selector: "TSTypeAnnotation[typeAnnotation.type='TSUnknownKeyword']",
          message:
            "Explicitly declaring variables as 'unknown' is restricted. Narrow down the type or define a domain-specific layout.",
        },
      ],

      // Disable base ESLint rules that conflict with TypeScript
      'no-unused-vars': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
          typedefs: true,
        },
      ],
    },
  },
];
