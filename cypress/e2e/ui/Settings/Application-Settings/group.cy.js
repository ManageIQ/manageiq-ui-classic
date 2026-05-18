import { flashClassMap } from '../../../../support/assertions/assertion_constants';

describe('Settings > Application Settings > Access Control > Add Group', () => {
  // Menu options
  const PRIMARY_MENU_OPTION = 'Settings';
  const SECONDARY_MENU_OPTION = 'Application Settings';
  const ACCORDION = 'Access Control';
  const TOOLBAR_MENU = 'Configuration';

  // Test data
  const GROUP_DESCRIPTION = '0Test Group';
  const GROUP_DETAILED_DESCRIPTION = 'Test group detailed description';
  const GROUP_ROLE = 'EvmRole-super_administrator';
  const GROUP_TENANT = 'My Company';

  // CRUD actions
  const FLASH_MESSAGE_OPERATION_ADDED = 'saved';
  const FLASH_MESSAGE_OPERATION_CANCELLED = 'cancelled';

  beforeEach(() => {
    cy.login();
    cy.menu(PRIMARY_MENU_OPTION, SECONDARY_MENU_OPTION);
    cy.accordion(ACCORDION);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('create a group', () => {
    cy.selectAccordionItem(['Groups']);
    cy.toolbar(TOOLBAR_MENU, 'Add a new Group');

    // Fill in the form
    cy.get('#description').clear().type(GROUP_DESCRIPTION);
    cy.get('#detailed_description').clear().type(GROUP_DETAILED_DESCRIPTION);

    // Select role from dropdown
    cy.get('.btn[data-id="group_role"]').click();
    cy.get('.btn[data-id="group_role"] ~ .dropdown-menu [data-original-index="1"] > a').then((option) => {
      cy.get(option).click();
    });

    // Select tenant from dropdown
    cy.get('.btn[data-id="group_tenant"]').click();
    cy.get('.btn[data-id="group_tenant"] ~ .dropdown-menu [data-original-index="1"] > a').then((option) => {
      cy.get(option).click();
    });

    const tagCategoryNames = [];
    const tagNames = {};

    // Select tag category from dropdown
    cy.get('#downshift-0-toggle-button').click();
    cy.get('ul#downshift-0-menu').then((categoryOptions) => {
      tagCategoryNames.push(categoryOptions[0].children[0].innerText);
      cy.get(categoryOptions[0].children[0]).click();

      // Select tags from dropdown
      cy.get('.cds--list-box__menu-item').then((tagOptions) => {
        tagNames[tagCategoryNames[0]] = [tagOptions[0].innerText, tagOptions[1].innerText];
        cy.get(tagOptions[0]).click();
        cy.get(tagOptions[1]).click();
      });
    });

    // Submit the form
    cy.getFormButtonByTypeWithText({
      buttonText: 'Add',
      buttonType: 'submit',
    }).click();

    // Verify success message
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_ADDED);

    // Verify that the new group is added to the list
    cy.gtlClickRow([{title: '0Test Group', number: 1}]);

    // Validate the new group contains the correct values
    cy.get('[tabindex="1"] > .content_value').contains(GROUP_DESCRIPTION);
    cy.get('[tabindex="2"] > .content_value').contains(GROUP_DETAILED_DESCRIPTION);
    cy.get('[tabindex="3"] > .content_value').contains(GROUP_ROLE);
    cy.get('[tabindex="4"] > .content_value').contains(GROUP_TENANT);

    // Validate the new group contains the correct tag categories and tags
    cy.get('.tag-category').then((tagCategories) => {
      tagCategoryNames.forEach((tagCategoryName, index) => {
        expect(tagCategories[index].children[0].children[0].title).contains(tagCategoryName);

        if (tagCategoryName.length > 18) {
          expect(tagCategories[index].children[0].innerText).contains(`${tagCategoryName.substring(0, 18)}...`);
        } else {
          expect(tagCategories[index].children[0].innerText).contains(tagCategoryName);
        }

        expect(tagCategories[index].children[1].innerText).contains(tagNames[tagCategoryName][0]);
        expect(tagCategories[index].children[2].innerText).contains(tagNames[tagCategoryName][1]);
      });
    });
  });

  it('should cancel group creation and return to groups list', () => {
    cy.selectAccordionItem(['Groups']);
    cy.toolbar(TOOLBAR_MENU, 'Add a new Group');

    // Click cancel
    cy.get('#buttons_off > .btn-default').click();

    // Verify we are back on the groups list page and the correct flash message is displayed
    cy.get('#explorer_title_text').contains('Access Control EVM Groups');
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_CANCELLED);

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
