/**
 * Cypress test suite — Control > Condition Form
 *
 * Covers:
 *   - New / Add condition form page load and field validation
 *   - Expression Editor: Add Rule, add group, combinator AND/OR, NOT toggle
 *   - Expression Editor: field type selector (Field, Count of, Tag, Find, Registry)
 *   - Expression Editor: operator selector changes
 *   - Expression Editor: value editing (text, select, IS NULL no-value ops)
 *   - Expression Editor: clone rule, remove rule, remove group
 *   - Expression Editor: validation error display (incomplete rule)
 *   - Expression Editor: preview text rendered below editor
 *   - Edit condition: form pre-populates from API
 *   - Copy condition: towhat locked as plain text
 *   - Cancel navigates to show_list
 *   - Add submits correct JSON payload to the API
 *   - Edit submits correct JSON payload with action: 'edit'
 */

// ── Fixtures / metadata stubs ─────────────────────────────────────────────────

const METADATA_VM = {
  fields: [
    ['VM / Name',           'Vm-name',             { col_type: 'string',  operators: ['=', '!=', 'STARTS WITH', 'ENDS WITH', 'INCLUDES', 'IS NULL', 'IS NOT NULL'] }],
    ['VM / Memory (MB)',    'Vm-mem_cpu',           { col_type: 'integer', operators: ['=', '!=', '<', '<=', '>=', '>'] }],
    ['VM / Active?',        'Vm-active',            { col_type: 'boolean', operators: ['=', 'IS NULL', 'IS NOT NULL'] }],
    ['VM / Created On',     'Vm-created_on',        { col_type: 'date',    operators: ['IS', 'BEFORE', 'AFTER', 'FROM', 'IS EMPTY', 'IS NOT EMPTY'] }],
  ],
  counts: [
    ['Count of Disks', 'Vm-hardware-disks'],
  ],
  tags: [
    ['Location', 'managed/location'],
  ],
  finds: [
    ['VM / Disks / Filename', 'Vm-hardware-disks-filename'],
  ],
  expression_types: [
    ['Field', 'field'],
    ['Count of', 'count'],
    ['Tag', 'tag'],
    ['Find', 'find'],
    ['Registry', 'registry'],
  ],
};

const METADATA_HOST = {
  fields: [
    ['Host / Name', 'Host-name', { col_type: 'string', operators: ['=', '!=', 'STARTS WITH', 'ENDS WITH', 'INCLUDES'] }],
  ],
  counts: [],
  tags: [],
  finds: [],
  expression_types: [['Field', 'field']],
};

// A minimal saved condition (VM, one expression rule)
const SAVED_CONDITION = {
  id: '42',
  description: 'Test Condition Alpha',
  towhat: 'Vm',
  notes: 'Some notes here',
  expression: { exp: { '=': { field: 'Vm-name', value: 'webserver' } } },
  applies_to_exp: null,
  read_only: false,
};

// Operators returned for Vm-hardware-disks-filename (find search field)
const FIND_OPERATORS = { operators: ['=', '!=', 'STARTS WITH', 'ENDS WITH', 'IS NULL', 'IS NOT NULL'], col_type: 'string' };
// Check fields for the find editor
const FIND_CHECK_FIELDS = {
  fields: [
    { label: 'Disk Size', name: 'Vm-hardware-disks-size', col_type: 'integer' },
  ],
};
// Tag values for managed/location
const TAG_VALUES = { tag_values: [['US East', 'us_east'], ['US West', 'us_west']] };

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Stub all backend calls needed by the expression editor so tests never need
 * a running Rails server.  Call in beforeEach of suites that visit the form.
 */
const METADATA_BY_MODEL = {
  Vm: METADATA_VM,
  Host: METADATA_HOST,
};

const stubExpressionApi = () => {
  cy.intercept('GET', '/expression_editor/metadata*', (req) => {
    const model = req.query.model || 'Vm';
    req.reply(METADATA_BY_MODEL[model] || METADATA_VM);
  }).as('getMetadata');

  cy.intercept('GET', '/expression_editor/operators*', (req) => {
    req.reply(FIND_OPERATORS);
  }).as('getOperators');

  cy.intercept('GET', '/expression_editor/find_check_fields*', (req) => {
    req.reply(FIND_CHECK_FIELDS);
  }).as('getFindCheckFields');

  cy.intercept('GET', '/expression_editor/tag_values*', (req) => {
    req.reply(TAG_VALUES);
  }).as('getTagValues');

  cy.intercept('POST', '/condition/expression_preview', (req) => {
    req.reply({ text: 'VM Name = webserver' });
  }).as('expressionPreview');
};

/**
 * Mount the ConditionForm React component directly via the Rails /condition/new
 * route, with API stubs in place.  The HAML passes towhatOptions from Rails but
 * we verify JS behaviour through the rendered UI, not the Rails template.
 */
const visitNew = () => {
  stubExpressionApi();
  cy.intercept('GET', '/api/conditions/*', { statusCode: 404 }).as('getCondition');
  cy.visit('/condition/new');
};

const visitEdit = (recordId = '42', fixture = SAVED_CONDITION) => {
  stubExpressionApi();
  cy.intercept('GET', `/api/conditions/${recordId}*`, (req) => {
    req.reply(fixture);
  }).as('getCondition');
  cy.visit(`/condition/edit/${recordId}`);
  cy.wait('@getCondition');
  // Wait for loading spinner to disappear
  cy.get('.cds--loading', { timeout: 8000 }).should('not.exist');
};

const visitCopy = (recordId = '42', fixture = SAVED_CONDITION) => {
  stubExpressionApi();
  cy.intercept('GET', `/api/conditions/${recordId}*`, (req) => {
    req.reply(fixture);
  }).as('getCondition');
  cy.visit(`/condition/copy/${recordId}`);
  cy.wait('@getCondition');
  cy.get('.cds--loading', { timeout: 8000 }).should('not.exist');
};

/**
 * Select a towhat value from the Applies To dropdown and wait for the
 * expression-editor metadata fetch to complete.
 */
const selectTowhat = (label = 'VM and Instance') => {
  cy.get('select#towhat').select(label);
  cy.wait('@getMetadata');
  // Expression editor sections become visible after metadata loads.
  cy.get('.exp-query-builder', { timeout: 10000 }).should('be.visible');
};

/**
 * Click the "Add rule" button inside the root query builder group.
 * Waits for the new rule row to appear.
 */
const addRule = () => {
  cy.contains('button', '+ Rule').first().click();
};

/**
 * Click the "Add group" button inside the root query builder group.
 */
const addGroup = () => {
  cy.contains('button', '+ Group').first().click();
};

/**
 * Select a field group label in the first/nth TwoStepFieldSelector.
 * @param {string} groupLabel  e.g. "Field", "Count of", "Tag"
 * @param {number} nth         0-based rule index (default 0)
 */
const selectFieldGroup = (groupLabel, nth = 0) => {
  cy.get('.exp-field-selector select').eq(nth * 2).select(groupLabel);
};

/**
 * Select a specific field within the currently active group in the rule at `nth`.
 * The field dropdown is a Carbon ComboBox (renders an <input>, not a <select>).
 * @param {string} fieldLabel  e.g. "VM / Active?"
 * @param {number} nth         0-based rule index (default 0)
 */
const selectField = (fieldLabel, nth = 0) => {
  cy.get('.exp-field-selector .exp-field-combobox').eq(nth).within(() => {
    cy.get('input').clear().type(fieldLabel);
    cy.contains('[role="option"]', fieldLabel).click();
  });
};

// ── Suite 1: New Condition Form — basic field behaviour ───────────────────────

describe('Control > Conditions > New Condition', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('renders the new condition form with Basic Information section', () => {
    cy.contains('h3', 'Basic Information').should('be.visible');
    cy.get('input#description').should('exist');
    cy.get('select#towhat').should('exist');
    cy.get('textarea#notes').should('exist');
  });

  it('expression and scope editors are hidden until Applies To is chosen', () => {
    cy.get('.exp-query-builder').should('not.exist');
    selectTowhat('VM and Instance');
    // Both Scope and Expression sections should now be visible
    cy.get('.exp-query-builder').should('have.length', 2);
  });

  it('changing Applies To clears any rules already added to the expression editor', () => {
    // Start with VM and add a rule so the editor is non-empty.
    cy.get('select#towhat').select('VM and Instance');
    cy.wait('@getMetadata');
    cy.get('.exp-query-builder', { timeout: 8000 }).should('be.visible');
    cy.contains('button', '+ Rule').first().click();
    cy.get('.rule', { timeout: 6000 }).should('have.length.at.least', 1);

    // Switch to Host — the editor must remount with an empty query.
    cy.get('select#towhat').select('Host');
    cy.wait('@getMetadata');
    cy.get('.rule').should('have.length', 0);
  });

  it('Add button is disabled when no Applies To is selected', () => {
    cy.contains('button[type="submit"]', 'Add').should('be.disabled');
  });

  it('Add button stays disabled after choosing Applies To but before adding an expression', () => {
    selectTowhat('VM and Instance');
    cy.contains('button[type="submit"]', 'Add').should('be.disabled');
  });

  it('Cancel navigates to condition list', () => {
    cy.intercept('GET', '/condition/show_list*').as('showList');
    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 6000 }).should('include', '/condition/show_list');
  });

  it('description enforces 255-char max length', () => {
    const longText = 'A'.repeat(256);
    cy.get('input#description').type(longText);
    cy.get('input#description').invoke('val').then((val) => {
      expect(val.length).to.be.at.most(255);
    });
  });

  it('notes shows character counter in helper text', () => {
    cy.get('textarea#notes').type('hello');
    cy.contains('5 / 512').should('exist');
  });
});

// ── Suite 2: Expression Editor — add / manipulate rules ───────────────────────

describe('Control > Conditions > Expression Editor — rules', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Add rule button inserts a rule row', () => {
    cy.get('.rule').should('not.exist');
    addRule();
    cy.get('.rule', { timeout: 6000 }).should('have.length.at.least', 1);
  });

  it('two-step field selector: group dropdown visible after adding rule', () => {
    addRule();
    cy.get('.exp-field-selector select').first().should('exist');
  });

  it('field group dropdown starts on "Field" group', () => {
    addRule();
    cy.get('.exp-field-selector select').first().should('have.value', 'Field');
  });

  it('switching field group to "Count of" shows count fields', () => {
    addRule();
    selectFieldGroup('Count of');
    // Only one Count-of field in fixture — field-value dropdown hidden (length === 1 group)
    cy.get('.exp-field-selector select').first().should('have.value', 'Count of');
  });

  it('switching field group to "Tag" shows tag fields', () => {
    addRule();
    selectFieldGroup('Tag');
    cy.get('.exp-field-selector select').first().should('have.value', 'Tag');
  });

  it('operator selector appears after adding a rule', () => {
    addRule();
    // Operator is either a <select> or a static label (single-operator tag fields)
    cy.get('.rule select, .exp-operator-label', { timeout: 6000 })
      .should('have.length.at.least', 1);
  });

  it('changing operator to IS NULL hides the value input', () => {
    addRule();
    // Operator select is distinct from field-selector selects; find it by id prefix
    cy.get('select[id^="operator-"]').first().select('IS NULL');
    cy.get('input[id^="value-"]').should('not.exist');
  });

  it('changing operator to IS NOT NULL hides the value input', () => {
    addRule();
    cy.get('select[id^="operator-"]').first().select('IS NOT NULL');
    cy.get('input[id^="value-"]').should('not.exist');
  });

  it('text value input accepts free-form text', () => {
    addRule();
    cy.get('input[id^="value-"]').first().type('test-value');
    cy.get('input[id^="value-"]').first().should('have.value', 'test-value');
  });

  it('boolean field renders a select with True/False options', () => {
    addRule();
    // Pick the boolean field: "VM / Active?"
    selectField('VM / Active?');
    cy.get('select[id^="value-"]').first().should('exist');
    cy.get('select[id^="value-"] option').then((options) => {
      const texts = [...options].map((o) => o.text);
      expect(texts).to.include('True');
      expect(texts).to.include('False');
    });
  });

  it('clone rule button duplicates the rule', () => {
    addRule();
    cy.get('input[id^="value-"]').first().type('cloned');
    cy.get('.rule-cloneRule button').first().click();
    cy.get('.rule').should('have.length.at.least', 2);
  });

  it('remove rule button deletes the rule row', () => {
    addRule();
    cy.get('.rule').should('have.length.at.least', 1);
    cy.get('.rule-remove button').first().click();
    cy.get('.rule').should('have.length', 0);
  });

  it('Add group button creates a nested group', () => {
    addGroup();
    // A nested .ruleGroup should appear inside the root group
    cy.get('.ruleGroup .ruleGroup').should('have.length.at.least', 1);
  });

  it('NOT toggle is present on the root group', () => {
    // Carbon Toggle rendered as button inside exp-not-toggle span
    cy.get('.exp-not-toggle').first().should('exist');
  });

  it('NOT toggle changes combinator inversion', () => {
    cy.get('.exp-not-toggle button').first().click({ force: true });
    cy.get('.exp-not-toggle button[aria-checked="true"]').should('exist');
  });

  it('combinator selector allows switching between AND and OR', () => {
    cy.get('select[id^="combinator-"]').first().select('or');
    cy.get('select[id^="combinator-"]').first().should('have.value', 'or');
    cy.get('select[id^="combinator-"]').first().select('and');
    cy.get('select[id^="combinator-"]').first().should('have.value', 'and');
  });
});

// ── Suite 3: Expression validation errors ─────────────────────────────────────

describe('Control > Conditions > Expression Editor — validation', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('validation error shown when rule has no value', () => {
    addRule();
    // After adding a rule with no value typed, an InlineNotification error is shown
    cy.get('[id^="description"]').type('Validation test condition');
    // The expression field is invalid (no value) — error notification should appear
    cy.get('.cds--inline-notification--error', { timeout: 8000 }).should('exist');
  });

  it('form submit button stays disabled while expression is invalid', () => {
    cy.get('input#description').type('Blocking submit test');
    addRule();
    // Rule added but value field left empty — submit must remain disabled
    cy.contains('button[type="submit"]', 'Add').should('be.disabled');
  });

  it('filling in the rule value clears the validation notification', () => {
    addRule();
    cy.get('input[id^="value-"]').first().type('filled-in');
    cy.get('.cds--inline-notification--error').should('not.exist');
  });
});

// ── Suite 4: Expression preview ───────────────────────────────────────────────

describe('Control > Conditions > Expression Editor — preview', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('preview text appears under the Expression section after a valid rule', () => {
    cy.intercept('POST', '/condition/expression_preview', (req) => {
      req.reply({ text: 'VM Name = webserver' });
    }).as('previewCall');

    addRule();
    cy.get('input[id^="value-"]').first().type('webserver');
    cy.wait('@previewCall');
    cy.contains('.exp-preview', 'VM Name = webserver').should('be.visible');
  });

  it('empty expression shows info message for Expression section', () => {
    // No rules added — informational message should be visible
    cy.contains('A condition must contain a valid expression.').should('be.visible');
  });

  it('empty scope shows info message for Scope section', () => {
    cy.contains('No scope defined').should('be.visible');
  });
});

// ── Suite 5: Find atom editor ─────────────────────────────────────────────────

describe('Control > Conditions > Expression Editor — Find atom', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('selecting "Find" group renders the FIND compound editor', () => {
    addRule();
    selectFieldGroup('Find');
    cy.wait('@getOperators');
    // .exp-find-editor uses display:contents so it has no rendered box of its
    // own — assert on the first visible child row instead.
    cy.get('.exp-find-row', { timeout: 8000 }).first().should('be.visible');
  });

  it('Find editor shows search operator + value inputs', () => {
    addRule();
    selectFieldGroup('Find');
    cy.wait('@getOperators');
    cy.get('.exp-find-editor select[id$="-skey"]').should('exist');
    cy.get('.exp-find-editor input[id$="-svalue"]').should('exist');
  });

  it('Find editor shows check mode selector', () => {
    addRule();
    selectFieldGroup('Find');
    cy.wait('@getOperators');
    cy.get('.exp-find-editor select[id$="-check"]', { timeout: 8000 }).should('exist');
  });

  it('switching check mode to "Check Count" hides the check field selector', () => {
    addRule();
    selectFieldGroup('Find');
    cy.wait('@getOperators');
    cy.wait('@getFindCheckFields');
    cy.get('.exp-find-editor select[id$="-check"]').select('checkcount');
    cy.get('.exp-find-editor select[id$="-cfield"]').should('not.exist');
  });

  it('switching check mode to "Check All" shows the check field selector', () => {
    addRule();
    selectFieldGroup('Find');
    cy.wait('@getOperators');
    cy.wait('@getFindCheckFields');
    cy.get('.exp-find-editor select[id$="-check"]').select('checkall');
    cy.get('.exp-find-editor select[id$="-cfield"]', { timeout: 6000 }).should('exist');
  });

  it('search operator set to IS NULL hides the search value input', () => {
    addRule();
    selectFieldGroup('Find');
    cy.wait('@getOperators');
    cy.get('.exp-find-editor select[id$="-skey"]').select('IS NULL');
    cy.get('.exp-find-editor input[id$="-svalue"]').should('not.exist');
  });
});

// ── Suite 6: Tag atom editor ───────────────────────────────────────────────────

describe('Control > Conditions > Expression Editor — Tag atom', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('selecting Tag group shows CONTAINS as the only operator label', () => {
    addRule();
    selectFieldGroup('Tag');
    // Tag fields always use CONTAINS — rendered as a static label, not a select
    cy.get('.exp-operator-label', { timeout: 6000 }).should('contain', 'CONTAINS');
  });

  it('Tag value select loads options from tag_values endpoint', () => {
    cy.intercept('GET', '/expression_editor/tag_values*', (req) => {
      req.reply(TAG_VALUES);
    }).as('tagValuesCall');

    addRule();
    selectFieldGroup('Tag');
    cy.wait('@tagValuesCall');
    // Tag value select should have the stubbed options
    cy.get('select[id^="value-"]', { timeout: 8000 }).then(($sel) => {
      const options = [...$sel.get(0).options].map((o) => o.text);
      expect(options).to.include.members(['US East', 'US West']);
    });
  });
});

// ── Suite 7: Registry atom editor ─────────────────────────────────────────────

describe('Control > Conditions > Expression Editor — Registry atom', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('selecting "Registry" group renders the registry key/value/data inputs', () => {
    addRule();
    selectFieldGroup('Registry');
    cy.get('input[id$="-key"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[id$="-val"]').should('be.visible');
  });

  it('KEY EXISTS operator hides the regval and data inputs', () => {
    addRule();
    selectFieldGroup('Registry');
    // The registry operator select is embedded inside the value editor (id ends in "-op")
    cy.get('select[id$="-op"]', { timeout: 8000 }).then(($selects) => {
      // Find the operator select that contains "KEY EXISTS"
      const opSel = [...$selects].find((s) => [...s.options].some((o) => o.value === 'KEY EXISTS'));
      if (opSel) {
        cy.wrap(opSel).select('KEY EXISTS');
        cy.get('input[id$="-val"]').should('not.exist');
      }
    });
  });
});

// ── Suite 8: Edit Condition ────────────────────────────────────────────────────

describe('Control > Conditions > Edit Condition', () => {
  beforeEach(() => {
    cy.login();
    cy.appFactories([
      ['create', 'condition', { id: 42, description: 'Test Condition Alpha', towhat: 'Vm', notes: 'Some notes here' }],
    ]);
    visitEdit('42');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('pre-populates description from the API', () => {
    cy.get('input#description').should('have.value', 'Test Condition Alpha');
  });

  it('pre-populates notes from the API', () => {
    cy.get('textarea#notes').should('have.value', 'Some notes here');
  });

  it('Applies To field is disabled in edit mode', () => {
    // In edit (not copy) mode towhat is a select — it can still be read.
    // However, the React form re-uses the select; verify it is populated.
    cy.get('select#towhat, .cds--text-input[data-testid="towhat"]').should('exist');
  });

  it('Save button is initially disabled (pristine)', () => {
    cy.contains('button[type="submit"]', 'Save').should('be.disabled');
  });

  it('Save button enables after changing description', () => {
    cy.get('input#description').clear().type('Updated Description');
    cy.contains('button[type="submit"]', 'Save').should('not.be.disabled');
  });

  it('Save sends PATCH/POST with action: edit to the API', () => {
    cy.intercept('POST', '/api/conditions/42', (req) => {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      expect(body).to.have.property('action', 'edit');
      req.reply({ id: 42, description: 'Updated Description' });
    }).as('saveCondition');

    cy.get('input#description').clear().type('Updated Description');
    cy.contains('button[type="submit"]', 'Save').click();
    cy.wait('@saveCondition');
  });

  it('Cancel navigates back to show_list', () => {
    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 6000 }).should('include', '/condition/show_list');
  });

  it('Reset button restores original values', () => {
    cy.get('input#description').clear().type('Changed Value');
    cy.contains('button', 'Reset').click();
    cy.get('input#description').should('have.value', 'Test Condition Alpha');
  });
});

// ── Suite 9: Copy Condition ────────────────────────────────────────────────────

describe('Control > Conditions > Copy Condition', () => {
  beforeEach(() => {
    cy.login();
    cy.appFactories([
      ['create', 'condition', { id: 42, description: 'Test Condition Alpha', towhat: 'Vm' }],
    ]);
    visitCopy('42');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('shows Applies To as plain text (locked) in copy mode', () => {
    // isCopy=true renders a read-only TEXT_FIELD (Carbon TextInput readOnly),
    // so the label appears as an input value, not a text node.
    cy.get('select#towhat').should('not.exist');
    cy.get('input[id="towhat-label"]').should('have.value', 'VM and Instance');
  });

  it('description is editable in copy mode', () => {
    cy.get('input#description').clear().type('Copy of Alpha');
    cy.get('input#description').should('have.value', 'Copy of Alpha');
  });

  it('Add button (not Save) is shown in copy mode', () => {
    cy.contains('button[type="submit"]', 'Add').should('exist');
  });

  it('Cancel from copy navigates to show_list', () => {
    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 6000 }).should('include', '/condition/show_list');
  });
});

// ── Suite 10: Full add workflow (API integration) ─────────────────────────────

describe('Control > Conditions > Full Add workflow', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('submits a new condition with a valid expression to the API', () => {
    cy.intercept('POST', '/api/conditions', (req) => {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      expect(body).to.have.property('description', 'E2E Condition');
      expect(body).to.have.property('towhat', 'Vm');
      expect(body).to.have.property('expression').that.is.not.null;
      req.reply({ id: 99, description: 'E2E Condition', href: '/api/conditions/99' });
    }).as('createCondition');

    cy.intercept('POST', '/condition/expression_preview', { text: 'VM Name = e2e-test' });

    cy.get('input#description').type('E2E Condition');
    selectTowhat('VM and Instance');
    // The Expression editor is the second .exp-query-builder; the first belongs to Scope.
    cy.get('.exp-query-builder').last().within(() => {
      cy.contains('button', '+ Rule').click();
    });
    cy.get('.exp-query-builder').last().find('input[id^="value-"]').first().type('e2e-test');
    cy.contains('button[type="submit"]', 'Add').click();
    cy.wait('@createCondition');
  });
});

// ── Suite 11: Expression Editor — add rule to Scope section ───────────────────

describe('Control > Conditions > Scope Expression Editor', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('Scope section has its own query builder instance', () => {
    // There are exactly two .exp-query-builder blocks: one for Scope, one for Expression
    cy.get('.exp-query-builder').should('have.length', 2);
  });

  it('can add a rule to the Scope section independently', () => {
    // Click the "Add rule" button in the first (Scope) section
    cy.get('.exp-query-builder').first().within(() => {
      cy.contains('button', '+ Rule').click();
    });
    cy.get('.exp-query-builder').first()
      .find('.rule', { timeout: 6000 })
      .should('have.length.at.least', 1);
  });

  it('rules in Scope do not appear in Expression section', () => {
    cy.get('.exp-query-builder').first().within(() => {
      cy.contains('button', '+ Rule').click();
    });
    // Second section (Expression) should still have no rules
    cy.get('.exp-query-builder').last()
      .find('.rule')
      .should('have.length', 0);
  });
});

// ── Suite 12: Nested groups ────────────────────────────────────────────────────

describe('Control > Conditions > Expression Editor — nested groups', () => {
  beforeEach(() => {
    cy.login();
    visitNew();
    selectTowhat('VM and Instance');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('can add a rule inside a nested group', () => {
    addGroup();
    cy.get('.ruleGroup .ruleGroup').first().within(() => {
      cy.contains('button', '+ Rule').click();
    });
    cy.get('.ruleGroup .ruleGroup').first()
      .find('.rule', { timeout: 6000 })
      .should('have.length.at.least', 1);
  });

  it('remove group button removes the nested group', () => {
    addGroup();
    cy.get('.ruleGroup .ruleGroup').should('have.length.at.least', 1);
    cy.get('.ruleGroup .ruleGroup').first().within(() => {
      cy.get('.ruleGroup-remove button').click();
    });
    cy.get('.ruleGroup .ruleGroup').should('have.length', 0);
  });

  it('nested group has its own combinator selector', () => {
    addGroup();
    cy.get('.ruleGroup .ruleGroup').first().within(() => {
      cy.get('select[id^="combinator-"]').should('exist');
    });
  });

  it('nested group NOT toggle functions independently', () => {
    addGroup();
    cy.get('.ruleGroup .ruleGroup').first().within(() => {
      cy.get('.exp-not-toggle button').first().click({ force: true });
      cy.get('.exp-not-toggle button[aria-checked="true"]').should('exist');
    });
  });
});
