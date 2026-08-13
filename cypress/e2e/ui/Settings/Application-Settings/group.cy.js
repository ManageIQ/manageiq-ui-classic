import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Settings > Application Settings > Access Control > Add Group', () => {
  // Menu options
  const PRIMARY_MENU_OPTION = 'Settings';
  const SECONDARY_MENU_OPTION = 'Application Settings';
  const ACCORDION = 'Access Control';
  const TOOLBAR_MENU = 'Configuration';

  // Test data
  const GROUP_DESCRIPTION = '0Test Group';
  const GROUP_DESCRIPTION_EDITED = '0Test Group Edited';
  const GROUP_DETAILED_DESCRIPTION = 'Test group detailed description';
  const GROUP_ROLE = 'EvmRole-super_administrator';
  const GROUP_TENANT = '[T] My Company';

  const MANAGEIQ_REGION_ACCORDION_LABEL = /^ManageIQ Region:/;

  beforeEach(() => {
    cy.login();
    cy.menu(PRIMARY_MENU_OPTION, SECONDARY_MENU_OPTION);
    cy.accordion(ACCORDION);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('adds, edits and deletes a group', () => {
    // ADD
    cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_LABEL, 'Groups']);
    cy.toolbar(TOOLBAR_MENU, 'Add a new Group');

    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(GROUP_DESCRIPTION);
    cy.getFormInputFieldByIdAndType({ inputId: 'detailed_description' })
      .clear()
      .type(GROUP_DETAILED_DESCRIPTION);
    cy.get('select#role_id').select(GROUP_ROLE, { force: true });
    cy.get('select#tenant_id').select(GROUP_TENANT, { force: true });

    // Tags tab — assign a tag category and value; capture their labels for later assertions
    cy.contains('.rbac-group-filter-tabs .cds--tabs__nav-item', 'Tags').click();
    cy.get('#dropdown-tag-select button.cds--list-box__field').click();
    cy.get('#dropdown-tag-select .cds--list-box__menu .cds--list-box__menu-item')
      .first()
      .then(($item) => {
        cy.wrap($item.text().trim()).as('tagCategory');
        cy.wrap($item).click();
      });
    cy.get('#multiselect-tag-select .cds--list-box__menu .cds--list-box__menu-item')
      .first()
      .then(($item) => {
        cy.wrap($item.text().trim()).as('tagValue');
        cy.wrap($item).click();
      });

    cy.interceptApi({
      alias: 'addGroupApi',
      urlPattern: '/api/groups',
      triggerFn: () =>
        cy
          .getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' })
          .click({ force: true }),
      onApiResponse: (interception) =>
        expect(interception.response.statusCode).to.equal(200),
    });
    cy.expect_flash(flashClassMap.success, 'added');

    // Open the group read-only view and verify all saved values
    cy.selectAccordionItem([
      MANAGEIQ_REGION_ACCORDION_LABEL,
      'Groups',
      GROUP_DESCRIPTION,
    ]);
    cy.get('.rbac-group-form #description').should('have.value', GROUP_DESCRIPTION);
    cy.get('.rbac-group-form #detailed_description').should('have.value', GROUP_DETAILED_DESCRIPTION);
    cy.get('.rbac-group-form #role_id').should('contain.text', GROUP_ROLE);
    cy.get('.rbac-group-form #tenant_id').should('contain.text', 'My Company');
    cy.get('.rbac-group-filter-tabs h3').should('have.text', 'Assigned Filters (read only)');
    cy.contains('.rbac-group-filter-tabs .cds--tabs__nav-item', 'Tags').click();
    cy.get('@tagCategory').then((cat) => {
      cy.get('.customer-tags-tab .category-label').invoke('attr', 'title').should('eq', cat);
    });
    cy.get('@tagValue').then((val) => {
      cy.get('.customer-tags-tab .tag-category .tag label').invoke('attr', 'title').should('eq', val);
    });

    // EDIT
    cy.toolbar(TOOLBAR_MENU, 'Edit this Group');

    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(GROUP_DESCRIPTION_EDITED);

    // Tags tab — switch to expression-based filtering and build a tag expression
    cy.contains('.rbac-group-filter-tabs .cds--tabs__nav-item', 'Tags').click();
    cy.get('select#use-filter-expression').select('expression', { force: true });

    // Wait for the QueryBuilder to seed an empty rule (field-group select appears)
    cy.get('.customer-tags-tab select[id^="field-group-"]').should('exist');

    // Step 1: The only group with onlyTags is "Tag" — select it
    cy.get('.customer-tags-tab select[id^="field-group-"]')
      .first()
      .select('Tag', { force: true });

    // Step 2: Pick the first tag field from the ComboBox
    cy.get('.customer-tags-tab .exp-field-combobox input')
      .first()
      .click({ force: true });
    cy.get('.customer-tags-tab .exp-field-combobox .cds--list-box__menu-item')
      .first()
      .then(($item) => {
        cy.wrap($item).click({ force: true });
      });

    // The value select id is "value-__tag__:<path>-<ruleIndex>" — parse the tag path from it
    cy.get('.customer-tags-tab select[id^="value-__tag__:"]')
      .should('not.be.disabled')
      .invoke('attr', 'id')
      .then((selectId) => {
        // selectId e.g. "value-__tag__:managed/location-0"
        const tagPath = selectId.replace(/^value-__tag__:/, '').replace(/-\d+$/, '');
        cy.wrap(tagPath).as('expressionTagPath');
      });

    // Pick the first non-empty value from the tag value select
    cy.get('.customer-tags-tab select[id^="value-__tag__:"]')
      .find('option')
      .not('[value=""]')
      .first()
      .then(($opt) => {
        cy.wrap($opt.val()).as('expressionTagValue');
        cy.get('.customer-tags-tab select[id^="value-__tag__:"]')
          .first()
          .select($opt.val(), { force: true });
      });

    // HAC tab — check first tree node if providers are configured
    cy.contains(
      '.rbac-group-filter-tabs .cds--tabs__nav-item',
      'Clusters, Datastores, Hosts'
    ).click();
    cy.get('.rbac-group-filter-tabs .belongs-to-tab').then(($tab) => {
      const checkboxes = $tab.find('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        cy.wrap(checkboxes.first()).check({ force: true });
      }
    });

    cy.interceptApi({
      alias: 'editGroupApi',
      urlPattern: /\/api\/groups\/\d+$/,
      triggerFn: () =>
        cy
          .getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' })
          .click({ force: true }),
      onApiResponse: (interception) =>
        expect(interception.response.statusCode).to.equal(200),
    });
    cy.expect_flash(flashClassMap.success, 'saved');

    // Open the edited group read-only view and verify the updated values
    cy.selectAccordionItem([
      MANAGEIQ_REGION_ACCORDION_LABEL,
      'Groups',
      GROUP_DESCRIPTION_EDITED,
    ]);
    cy.get('.rbac-group-form #description').should('have.value', GROUP_DESCRIPTION_EDITED);
    cy.get('.rbac-group-filter-tabs h3').should('have.text', 'Assigned Filters (read only)');
    cy.contains('.rbac-group-filter-tabs .cds--tabs__nav-item', 'Tags').click();
    cy.get('.customer-tags-tab pre').should('exist').then(($pre) => {
      const saved = JSON.parse($pre.text());
      cy.get('@expressionTagPath').then((tagPath) => {
        expect(saved).to.have.nested.property('CONTAINS.tag', tagPath);
      });
      cy.get('@expressionTagValue').then((tagValue) => {
        expect(saved).to.have.nested.property('CONTAINS.value', tagValue);
      });
    });

    // DELETE
    cy.toolbar(TOOLBAR_MENU, 'Delete this Group');
    cy.expect_flash(flashClassMap.success, 'delete');

    cy.get('.miq-data-table table tbody').should(
      'not.contain',
      GROUP_DESCRIPTION_EDITED
    );
  });

  it('should enforce maximum length on description field', () => {
    cy.selectAccordionItem(['Groups']);
    cy.toolbar(TOOLBAR_MENU, 'Add a new Group');

    // Description field has maxlength of 50
    const longDescription = 'A'.repeat(60);
    cy.get('#description').clear().type(longDescription);

    // Verify only 50 characters are accepted
    cy.get('#description').invoke('val').should('have.length', 50);
  });

  it('should enforce maximum length on detailed description field', () => {
    cy.selectAccordionItem(['Groups']);
    cy.toolbar(TOOLBAR_MENU, 'Add a new Group');

    // Detailed description field has maxlength of 255
    const longDetailedDescription = 'A'.repeat(300);
    cy.get('#detailed_description').clear().type(longDetailedDescription);

    // Verify only 255 characters are accepted
    cy.get('#detailed_description').invoke('val').should('have.length', 255);
  });
});
