/* eslint-disable no-undef */
describe('Settings > Application Settings > Diagnostics > Orphaned Data', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Settings', 'Application Settings');
    cy.wait(1000);

    cy.get('#control_diagnostics_accord > .panel-title > a').click(true);
    cy.get('[data-nodeid="0.0"].node-treeview-settings_tree').contains('ManageIQ Region').click({force: true});
    cy.wait(1000);
    // Click the Orphaned Data tab
    cy.get('.nav-tabs #diagnostics_orphaned_data_tab')
      .contains('Orphaned Data')
      .click({force: true});
  });

  it('should list the orphaned data', () => {
    cy.get('#diagnostics_orphaned_data .diagnostics-orphaned-data-list')
      .find('table')
      .find('tbody')
      .find('tr')
      .should('have.length.greaterThan', 0);
  });

  it('attempts to delete orphaned data, but cancels later', () => {
    cy.get('.diagnostics-orphaned-data-list')
      .find('table tbody tr')
      .first()
      .find('td')
      .last()
      .find('button').click();

    // Assert the confirm dialog opens
    cy.get('.bx--modal-container').should('be.visible');

    // Cancel the delete action
    cy.get('.bx--modal-container')
      .find('.bx--modal-footer')
      .contains('button', 'Cancel')
      .click();
  });

  it('should delete orphaned data', () => {
    cy.get('.diagnostics-orphaned-data-list')
      .find('table tbody tr')
      .first()
      .find('td')
      .last()
      .find('button').click();

    // Confirms the delete action
    cy.get('.bx--modal-container')
      .find('.bx--modal-footer')
      .contains('button', 'Ok')
      .click();

    cy.get('.bx--modal-container').should('not.exist');
  });
});
