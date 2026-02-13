/* eslint-disable no-undef */
import { flashClassMap } from "../../../../support/assertions/assertion_constants";

describe('Settings > Application Settings > Details', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Settings', 'Application Settings');
    cy.accordion('Settings');
    cy.selectAccordionItem([/^ManageIQ Region:/]);
    cy.expect_explorer_title('ManageIQ Region');
  });

  describe('Settings Details Tab', () => {
    it('Click row and reroute', () => {
      cy.get('.cds--front-line').contains('Region 0').click();
      cy.getFormLabelByForAttribute({ forValue: 'description' }).should('be.visible');

      cy.get('.cds--front-line').contains('Analysis Profiles').click();
      cy.expect_explorer_title('Settings Analysis Profiles');
      cy.selectAccordionItem([/^ManageIQ Region:/]);

      cy.get('.cds--front-line').contains('Zones').click();
      cy.expect_explorer_title('Settings Zones');
      cy.selectAccordionItem([/^ManageIQ Region:/]);

      cy.get('.cds--front-line').contains('Schedules').click();
      cy.expect_explorer_title('Settings Schedules');
    });

    it('Updates region name when changed', () => {
      cy.get('.cds--front-line').contains('Region 0').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Region 1');
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.enabled').click();
      cy.expect_flash(flashClassMap.success, 'saved');
      cy.get('.cds--front-line').contains('Region 1').should('be.visible');

      // Clean up
      cy.get('.cds--front-line').contains('Region 1').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).clear().type('Region 0');
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.enabled').click();
      cy.expect_flash(flashClassMap.success, 'saved');
      cy.get('.cds--front-line').contains('Region 0').should('be.visible');
    });
  });
});
