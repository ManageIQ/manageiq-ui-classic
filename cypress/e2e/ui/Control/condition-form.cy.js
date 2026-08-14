const METADATA_VM = {
  fields: [
    ['VM / Name', 'Vm-name', { col_type: 'string', operators: ['=', '!=', 'STARTS WITH', 'ENDS WITH', 'INCLUDES', 'IS NULL', 'IS NOT NULL'] }],
    ['VM / Memory (MB)', 'Vm-mem_cpu', { col_type: 'integer', operators: ['=', '!=', '<', '<=', '>=', '>'] }],
    ['VM / Active?', 'Vm-active', { col_type: 'boolean', operators: ['=', 'IS NULL', 'IS NOT NULL'] }],
    ['VM / Created On', 'Vm-created_on', { col_type: 'date', operators: ['IS', 'BEFORE', 'AFTER', 'FROM', 'IS EMPTY', 'IS NOT EMPTY'] }],
  ],
  counts: [
    ['Count of Disks', 'Vm-hardware-disks'],
    ['Count of NICs', 'Vm-hardware-nics'],
  ],
  tags: [
    ['Location', 'managed/location'],
    ['Environment', 'managed/environment'],
  ],
  finds: [
    ['VM / Disks / Filename', 'Vm-hardware-disks-filename'],
    ['VM / Disks / Mode', 'Vm-hardware-disks-mode'],
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

};

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
  cy.contains('button', 'Add Rule').first().click();
};

/**
 * Click the "Add group" button inside the root query builder group.
 */
const addGroup = () => {
  cy.contains('button', 'Add Sub-Group').first().click();
};

/**
 * Select a field group label in the first/nth TwoStepFieldSelector.
 * Each .exp-field-selector contains exactly one <select> (the group dropdown).
 * @param {string} groupLabel  e.g. "Field", "Count of", "Tag"
 * @param {number} nth         0-based rule index (default 0)
 */
const selectFieldGroup = (groupLabel, nth = 0) => {
  cy.get('.exp-field-selector select').eq(nth).select(groupLabel);
};

/**
 * Select a specific field within the currently active group in the rule at `nth`.
 * The field dropdown is a Carbon ComboBox (renders an <input>, not a <select>).
 * @param {string} fieldLabel  e.g. "VM / Active?"
 * @param {number} nth         0-based combobox index among visible comboboxes (default 0)
 */
const selectField = (fieldLabel, nth = 0) => {
  cy.get('.exp-field-selector .exp-field-combobox input').eq(nth)
    .click()
    .clear()
    .type(fieldLabel);
  cy.contains('[role="option"]', fieldLabel).click();
};

beforeEach(() => {
  cy.login();
});

afterEach(() => {
  cy.appDbState('restore');
});

describe('Control > Conditions > New Condition', () => {
  beforeEach(() => {
    visitNew();
  });

  it('renders Basic Information fields and Add button is disabled until a valid expression exists', () => {
    cy.contains('h3', 'Basic Information').should('be.visible');
    cy.get('input#description').should('exist');
    cy.get('select#towhat').should('exist');
    cy.get('textarea#notes').should('exist');
    // Editors hidden and submit disabled before Applies To is chosen
    cy.get('.exp-query-builder').should('not.exist');
    cy.contains('button[type="submit"]', 'Add').should('be.disabled');

    // After choosing Applies To both editors appear but submit stays disabled
    selectTowhat('VM and Instance');
    cy.get('.exp-query-builder').should('have.length', 2);
    cy.contains('button[type="submit"]', 'Add').should('be.disabled');
  });

  it('changing Applies To resets the expression editor with a fresh seeded rule', () => {
    cy.get('select#towhat').select('VM and Instance');
    cy.wait('@getMetadata');
    cy.get('.exp-query-builder', { timeout: 8000 }).should('be.visible');
    // Expression editor seeds 1 rule; add an extra so we can confirm it resets.
    cy.get('.exp-query-builder').last().within(() => {
      cy.contains('button', 'Add Rule').click();
    });
    cy.get('.exp-query-builder').last()
      .find('.rule', { timeout: 6000 })
      .should('have.length', 2);

    cy.get('select#towhat').select('Host');
    cy.wait('@getMetadata');
    // After switching, the Expression editor resets and re-seeds exactly 1 rule.
    cy.get('.exp-query-builder').last()
      .find('.rule', { timeout: 6000 })
      .should('have.length', 1);
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
});

describe('Control > Conditions > Expression Editor — rules', () => {
  beforeEach(() => {
    visitNew();
    selectTowhat('VM and Instance');
  });

  it('Add rule button inserts an additional rule row', () => {
    // Only the Expression editor seeds 1 rule on load (Scope starts empty).
    cy.get('.rule', { timeout: 6000 }).should('have.length', 1);
    addRule();
    cy.get('.rule', { timeout: 6000 }).should('have.length', 2);
  });

  it('field selector is visible on the seeded rule and selecting a group shows fields', () => {
    cy.get('.exp-field-selector select').first().should('exist');
    // Group dropdown starts at empty ('<Choose>') until the user picks a group.
    cy.get('.exp-field-selector select').first().should('have.value', '');

    // After choosing a group the group dropdown reflects the selection.
    selectFieldGroup('Field');
    cy.get('.exp-field-selector select').first().should('have.value', 'Field');
    cy.get('.rule select, .exp-operator-label', { timeout: 6000 })
      .should('have.length.at.least', 1);
  });

  it('switching field group updates the group dropdown for each type', () => {
    selectFieldGroup('Count of');
    cy.get('.exp-field-selector select').first().should('have.value', 'Count of');

    selectFieldGroup('Tag');
    cy.get('.exp-field-selector select').first().should('have.value', 'Tag');

    // Return to Field to confirm switching back also works
    selectFieldGroup('Field');
    cy.get('.exp-field-selector select').first().should('have.value', 'Field');
  });

  it('value input behaviour: IS NULL/IS NOT NULL hides it, free text works, boolean field shows True/False', () => {
    // Select a string field first so the operator dropdown appears.
    // Field group must be chosen before the ComboBox for individual fields appears.
    selectFieldGroup('Field');
    selectField('VM / Name');

    // Null operators hide the value input
    cy.get('select[id^="operator-"]').first().select('IS NULL');
    cy.get('input[id^="value-"]').should('not.exist');
    cy.get('select[id^="operator-"]').first().select('IS NOT NULL');
    cy.get('input[id^="value-"]').should('not.exist');

    // Restore to = so the text input is visible again
    cy.get('select[id^="operator-"]').first().select('=');
    cy.get('input[id^="value-"]').first().type('test-value');
    cy.get('input[id^="value-"]').first().should('have.value', 'test-value');

    // Boolean field renders a select with True/False options
    selectField('VM / Active?');
    cy.get('select[id^="value-"]').first().should('exist');
    cy.get('select[id^="value-"] option').then((options) => {
      const texts = [...options].map((o) => o.text);
      expect(texts).to.include('True');
      expect(texts).to.include('False');
    });
  });

  it('clone rule duplicates the row, remove rule deletes it', () => {
    // Only the Expression editor has a seeded rule — no Scope ambiguity.
    // Use top-level helpers (no .within()) so selectField's inner .within() works.
    selectFieldGroup('Field');
    selectField('VM / Name');
    cy.get('input[id^="value-"]').first().type('cloned');
    cy.get('.exp-query-builder').last().find('.rule-cloneRule').first().click();
    cy.get('.exp-query-builder').last().find('.rule').should('have.length', 2);

    cy.get('.exp-query-builder').last().find('.rule-remove').first().click();
    cy.get('.exp-query-builder').last().find('.rule').should('have.length', 1);
  });

  it('root group combinator and NOT toggle controls work correctly', () => {
    cy.get('.exp-not-toggle').first().should('exist');
    cy.get('.exp-not-toggle button').first().click({ force: true });
    cy.get('.exp-not-toggle button[aria-checked="true"]').should('exist');

    cy.get('select[id^="combinator-"]').first().select('or');
    cy.get('select[id^="combinator-"]').first().should('have.value', 'or');
    cy.get('select[id^="combinator-"]').first().select('and');
    cy.get('select[id^="combinator-"]').first().should('have.value', 'and');
  });
});

describe('Control > Conditions > Expression Editor — validation and preview', () => {
  beforeEach(() => {
    visitNew();
    selectTowhat('VM and Instance');
  });

  it('invalid rule shows error and blocks submit; filling value clears error and shows preview', () => {
    selectFieldGroup('Field');
    selectField('VM / Name');
    // Trigger description field so validation runs
    cy.get('[id^="description"]').type('Validation test condition');
    // Rule has a field but no value — error notification must be visible and submit disabled
    cy.get('.cds--inline-notification--error', { timeout: 8000 }).should('exist');
    cy.contains('button[type="submit"]', 'Add').should('be.disabled');

    // Fill in the value — error clears and preview appears (rendered client-side)
    cy.get('input[id^="value-"]').first().type('filled-in');
    cy.get('.cds--inline-notification--error').should('not.exist');
    cy.get('.exp-preview', { timeout: 8000 }).should('be.visible');
    cy.get('.exp-preview div').last().invoke('text').should('not.be.empty');
  });
});

describe('Control > Conditions > Expression Editor — Atom editors', () => {
  beforeEach(() => {
    visitNew();
    selectTowhat('VM and Instance');
  });

  it('Find atom editor: renders correctly and responds to check-mode and operator changes', () => {
    selectFieldGroup('Find');
    selectField('VM / Disks / Filename');
    cy.wait('@getOperators');

    // Editor is visible with all expected controls
    cy.get('.exp-find-row', { timeout: 8000 }).first().should('be.visible');
    cy.get('.exp-find-editor select[id$="-skey"]').should('exist');
    cy.get('.exp-find-editor input[id$="-svalue"]').should('exist');
    cy.get('.exp-find-editor select[id$="-check"]', { timeout: 8000 }).should('exist');

    // IS NULL on the search operator hides the search value input
    cy.get('.exp-find-editor select[id$="-skey"]').select('IS NULL');
    cy.get('.exp-find-editor input[id$="-svalue"]').should('not.exist');
    // Restore so the svalue input is present again for subsequent assertions
    cy.get('.exp-find-editor select[id$="-skey"]').select('=');
    cy.get('.exp-find-editor input[id$="-svalue"]').should('exist');

    cy.wait('@getFindCheckFields');

    // "Check Count" hides the check field selector
    cy.get('.exp-find-editor select[id$="-check"]').select('checkcount');
    cy.get('.exp-find-editor select[id$="-cfield"]').should('not.exist');

    // "Check All" shows the check field selector
    cy.get('.exp-find-editor select[id$="-check"]').select('checkall');
    cy.get('.exp-find-editor select[id$="-cfield"]', { timeout: 6000 }).should('exist');
  });

  it('Tag atom: shows CONTAINS operator and loads tag values from the endpoint', () => {
    cy.intercept('GET', '/expression_editor/tag_values*', (req) => {
      req.reply(TAG_VALUES);
    }).as('tagValuesCall');

    selectFieldGroup('Tag');
    selectField('Location');
    // Tag fields always use CONTAINS — rendered as a static label, not a select
    cy.get('.exp-operator-label', { timeout: 6000 }).should('contain', 'CONTAINS');

    cy.wait('@tagValuesCall');
    // Tag value select should have the stubbed options
    cy.get('select[id^="value-"]', { timeout: 8000 }).then(($sel) => {
      const options = [...$sel.get(0).options].map((o) => o.text);
      expect(options).to.include.members(['US East', 'US West']);
    });
  });

  it('Registry atom: group is selectable (single-option group, no field ComboBox)', () => {
    selectFieldGroup('Registry');
    // Registry is always a single-option group so no ComboBox is rendered.
    // Assert the group dropdown correctly reflects the selection.
    cy.get('.exp-field-selector select').first().should('have.value', 'Registry');
  });
});

describe('Control > Conditions > Edit Condition', () => {
  let conditionId;

  beforeEach(() => {
    cy.appFactories([
      ['create', 'condition', { description: 'Test Condition Alpha', towhat: 'Vm', notes: 'Some notes here' }],
    ]).then(([record]) => {
      conditionId = String(record.id);
      visitEdit(conditionId);
    });
  });

  it('loads form correctly: pre-populates fields, Applies To exists, Save is disabled', () => {
    cy.get('input#description').should('have.value', 'Test Condition Alpha');
    cy.get('textarea#notes').should('have.value', 'Some notes here');
    // In edit (not copy) mode towhat is a select — it can still be read.
    cy.get('select#towhat, .cds--text-input[data-testid="towhat"]').should('exist');
    cy.contains('button[type="submit"]', 'Save').should('be.disabled');
  });

  it('Save button enables after editing description, Reset restores original value', () => {
    cy.get('input#description').clear().type('Updated Description');
    cy.contains('button[type="submit"]', 'Save').should('not.be.disabled');

    cy.contains('button', 'Reset').click();
    cy.get('input#description').should('have.value', 'Test Condition Alpha');
    cy.contains('button[type="submit"]', 'Save').should('be.disabled');
  });

  it('Save sends POST with action: edit to the API', () => {
    cy.then(() => {
      cy.intercept('POST', `/api/conditions/${conditionId}`, (req) => {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        expect(body).to.have.property('action', 'edit');
        req.reply({ id: Number(conditionId), description: 'Updated Description' });
      }).as('saveCondition');
    });

    cy.get('input#description').clear().type('Updated Description');
    cy.contains('button[type="submit"]', 'Save').click();
    cy.wait('@saveCondition');
  });

  it('Cancel navigates back to show_list', () => {
    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 6000 }).should('include', '/condition/show_list');
  });
});

describe('Control > Conditions > Copy Condition', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'condition', { description: 'Test Condition Alpha', towhat: 'Vm' }],
    ]).then(([record]) => {
      visitCopy(String(record.id));
    });
  });

  it('shows Applies To as locked plain text and description is editable in copy mode', () => {
    cy.get('select#towhat').should('not.exist');
    cy.get('input[id="towhat-label"]').should('have.value', 'VM and Instance');

    cy.get('input#description').clear().type('Copy of Alpha');
    cy.get('input#description').should('have.value', 'Copy of Alpha');
  });

  it('Add button (not Save) is shown and Cancel navigates to show_list in copy mode', () => {
    cy.contains('button[type="submit"]', 'Add').should('exist');

    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 6000 }).should('include', '/condition/show_list');
  });
});

describe('Control > Conditions > Full Add workflow', () => {
  beforeEach(() => {
    visitNew();
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
    // The Expression editor already has a seeded rule; Scope has none.
    // Only one .exp-field-selector select exists at this point (nth=0).
    selectFieldGroup('Field');
    selectField('VM / Name');
    cy.get('.exp-query-builder').last().find('input[id^="value-"]').first().type('e2e-test');
    cy.contains('button[type="submit"]', 'Add').click();
    cy.wait('@createCondition');
  });
});

describe('Control > Conditions > Scope Expression Editor', () => {
  beforeEach(() => {
    visitNew();
    selectTowhat('VM and Instance');
  });

  it('Scope and Expression sections are independent query builder instances', () => {
    // There are exactly two .exp-query-builder blocks: one for Scope, one for Expression.
    cy.get('.exp-query-builder').should('have.length', 2);

    // Scope starts with 0 rules; Expression seeds 1 rule on load.
    cy.get('.exp-query-builder').first()
      .find('.rule')
      .should('have.length', 0);
    cy.get('.exp-query-builder').last()
      .find('.rule', { timeout: 6000 })
      .should('have.length', 1);

    // Adding a rule to Scope does not affect the Expression section's count.
    cy.get('.exp-query-builder').first().within(() => {
      cy.contains('button', 'Add Rule').click();
    });
    cy.get('.exp-query-builder').first()
      .find('.rule', { timeout: 6000 })
      .should('have.length', 1);
    cy.get('.exp-query-builder').last()
      .find('.rule')
      .should('have.length', 1);
  });
});

describe('Control > Conditions > Expression Editor — nested groups', () => {
  beforeEach(() => {
    visitNew();
    selectTowhat('VM and Instance');
  });

  it('Add group button creates a nested group and group controls work correctly', () => {
    addGroup();
    cy.get('.ruleGroup .ruleGroup').should('have.length.at.least', 1);

    // New groups start with one seeded rule (addRuleToNewGroups is enabled).
    cy.get('.ruleGroup .ruleGroup').first()
      .find('.rule', { timeout: 6000 })
      .should('have.length', 1);

    // Each nested group has its own combinator selector
    cy.get('.ruleGroup .ruleGroup').first().within(() => {
      cy.get('select[id^="combinator-"]').should('exist');
    });

    // NOT toggle functions independently inside the nested group
    cy.get('.ruleGroup .ruleGroup').first().within(() => {
      cy.get('.exp-not-toggle button').first().click({ force: true });
      cy.get('.exp-not-toggle button[aria-checked="true"]').should('exist');
    });

    // Remove group button removes the nested group
    cy.get('.ruleGroup .ruleGroup').first().within(() => {
      cy.get('.ruleGroup-remove').click();
    });
    cy.get('.ruleGroup .ruleGroup').should('have.length', 0);
  });
});
