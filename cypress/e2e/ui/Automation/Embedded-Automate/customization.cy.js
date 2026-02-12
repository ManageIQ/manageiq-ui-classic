/* eslint-disable no-undef */
import { flashClassMap } from "../../../../support/assertions/assertion_constants";

describe('Automation > Embedded Automate > Customization', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.expect_explorer_title('All Dialogs');
  });

  describe('Dialog Form', () => {
    it('Clicks the cancel button', () => {
      cy.toolbar('Configuration', 'Add a new Dialog');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      cy.expect_explorer_title('All Dialogs');
    });

    it('Clicks on a sample dialog', () => {
      cy.selectAccordionItem(['All Dialogs', 'Configured System Provision', 'Sample Configuration Management Provisioning Dialog']);
      cy.get('.miq_ae_customization_summary').contains('miq_provision_configured_system_foreman_dialogs');
      cy.get('.miq_ae_customization_summary').contains('Sample Configuration Management Provisioning Dialog');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':buttons:');
    });

    it('Resets a dialog being edited', () => {
      // creates a dialog
      cy.toolbar('Configuration', 'Add a new Dialog');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Test User');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test Description');
      cy.getFormSelectFieldById({ selectId: 'dialog_type' }).select('Configured System Provision');
      cy.get('[class="CodeMirror-lines"]').type(':Buttons');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // check correct data is displaying
      cy.selectAccordionItem(['All Dialogs', 'Configured System Provision', 'Test Description']);
      cy.get('.miq_ae_customization_summary').contains('Test User');
      cy.get('.miq_ae_customization_summary').contains('Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons');

      // edits a dialog
      cy.toolbar('Configuration', 'Edit this Dialog');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('Edited Test User');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Edited Test Description');
      cy.getFormSelectFieldById({ selectId: 'dialog_type' }).select('Physical Server Provision');
      cy.get('[class="CodeMirror-lines"]').type('\n :submit:\n:cancel:');
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      // check it was reset
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', 'Test User');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should('have.value', 'Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains(':Buttons');
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      // clean up
      cy.toolbar('Configuration', 'Remove Dialog');
      cy.expect_flash(flashClassMap.success, 'delete');
    });

    it('Creates, edits, deletes a dialog', () => {
      // creates a dialog
      cy.toolbar('Configuration', 'Add a new Dialog');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Test User');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test Description');
      cy.getFormSelectFieldById({ selectId: 'dialog_type' }).select('Configured System Provision');
      cy.get('[class="CodeMirror-lines"]').type('\nreturn null;');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // check correct data is displaying
      cy.selectAccordionItem(['All Dialogs', 'Configured System Provision', 'Test Description']);
      cy.get('.miq_ae_customization_summary').contains('Test User');
      cy.get('.miq_ae_customization_summary').contains('Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains('return null');

      // edits a dialog
      cy.toolbar('Configuration', 'Edit this Dialog');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('Edited Test User');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Edited Test Description');
      cy.getFormSelectFieldById({ selectId: 'dialog_type' }).select('Physical Server Provision');
      cy.get('[class="CodeMirror-lines"]').type('\nreturn 1;');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      // check correct data after editing
      cy.get('.miq_ae_customization_summary').contains('Edited Test User');
      cy.get('.miq_ae_customization_summary').contains('Edited Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains('return null');
      cy.get('[class="CodeMirror-code"]').contains('return 1');

      // clean up
      cy.toolbar('Configuration', 'Remove Dialog');
      cy.expect_flash(flashClassMap.success, 'delete');
    });

    it('Creates, copies, and deletes a dialog', () => {
      // creates a dialog
      cy.toolbar('Configuration', 'Add a new Dialog');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Test User');
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test Description');
      cy.getFormSelectFieldById({ selectId: 'dialog_type' }).select('Configured System Provision');
      cy.get('[class="CodeMirror-lines"]').type('\nreturn null;');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();

      // check correct data is displaying
      cy.get('.miq_ae_customization_summary').contains('Test User');
      cy.get('.miq_ae_customization_summary').contains('Test Description');
      cy.get('[class="CodeMirror-code"]').contains('---');
      cy.get('[class="CodeMirror-code"]').contains('return null');

      // copies a dialog
      cy.toolbar('Configuration', 'Copy this Dialog');
      cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click();
      cy.expect_explorer_title('Test Description');
      cy.get('.miq_ae_customization_summary').contains('Copy of Test User');

      // clean up
      cy.toolbar('Configuration', 'Remove Dialog');
      cy.expect_flash(flashClassMap.success, 'delete');

      cy.expect_explorer_title('Configured System Provision Dialogs');
      cy.selectAccordionItem(['All Dialogs', 'Configured System Provision', 'Test Description']);
      cy.get('.miq_ae_customization_summary').contains('Test User');
      cy.toolbar('Configuration', 'Remove Dialog');
      cy.expect_flash(flashClassMap.success, 'delete');
    });
  });

  describe('Button Form', () => {
    beforeEach(() => {
      cy.accordion('Buttons');
    });

    it('Validates the save button correctly', () => {
      cy.selectAccordionItem(['Object Types', 'Availability Zone', /Unassigned Buttons/]);
      cy.toolbar('Configuration', 'Add a new Button');
      cy.expect_explorer_title('Adding a new Button');

      cy.get('#name').type('Test Button');
      cy.get('#description').type('Test Description');
      cy.get('.icon-button').click();
      cy.get(':nth-child(1) > span > .ff').click();
      cy.get('.cds--modal-footer > .cds--btn--primary').click();

      cy.get('#ab_advanced_tab_tab > a').click();
      cy.get('#object_request').type('Test Request');
      cy.get('#attribute_1').type('1-attribute');
      cy.get('#value_1').type('1-value');
      cy.get('#attribute_2').type('2-attribute');
      cy.get('#value_2').type('2-value');
      cy.get('.col-md-10 > .btn-group > .btn').click();
      cy.get('.col-md-10 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').click();

      cy.get('#roles_1').click();
      cy.get('#roles_2').click();
      cy.get('#roles_3').click();
      cy.get('#roles_4').click();

      cy.get('#buttons_on > .btn-primary').click();
      cy.get('.clickable-row').contains('Test Button').click();

      cy.get('.attribute_value_pair').contains('1-attribute, 1-value');
      cy.get('.attribute_value_pair').contains('2-attribute, 2-value');
      cy.get('.visibility').contains('EvmRole-administrator, EvmRole-approver, EvmRole-physical_storages_administrator, EvmRole-super_administrator');

      cy.toolbar('Configuration', 'Edit this Button');

      cy.get('#buttons_off > .btn-primary');
      cy.get('#ab_advanced_tab_tab > a').click();
      cy.get('#attribute_2').clear();
      cy.get('#value_2').clear();

      cy.get('#buttons_on > .btn-primary').click();

      cy.get('.attribute_value_pair').contains('1-attribute, 1-value');
      cy.get('.attribute_value_pair').should('not.contain', '2-attribute, 2-value');

      cy.toolbar('Configuration', 'Edit this Button');

      cy.get('#buttons_off > .btn-primary');
      cy.get('#ab_advanced_tab_tab > a').click();

      cy.get('#roles_2').click();
      cy.get('#roles_3').click();

      cy.get('#buttons_on > .btn-primary').click();

      cy.get('.visibility').contains('EvmRole-approver, EvmRole-super_administrator');
      cy.get('.visibility').should('not.contain', 'EvmRole-administrator, EvmRole-physical_storages_administrator');

      cy.toolbar('Configuration', 'Remove this Button');
      cy.expect_modal({ modalHeaderText: 'Delete Button', modalContentExpectedTexts: ['Test Button'], targetFooterButtonText: 'Delete' });
      cy.expect_flash(flashClassMap.success, 'deleted');
    });
  });
});
