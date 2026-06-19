describe('Settings Zone Tabs', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Settings', 'Application Settings');
    cy.accordion('Settings');
    cy.selectAccordionItem([/^ManageIQ Region:/, 'Zones']);
  });

  it('displays zone tabs when zone node is selected', () => {
    // Click on a zone node (default zone should exist)
    cy.get('li.list-group-item').contains(/^Zone:/).first().click();

    // Verify the MiqCustomTab component is rendered
    cy.get('#settings-zone-tabs-wrapper').should('be.visible');
    cy.get('.miq_custom_tabs').should('be.visible');

    // Verify all three tabs are present
    cy.contains('button', 'Zone').should('be.visible');
    cy.contains('button', 'SmartProxy Affinity').should('be.visible');
    cy.contains('button', 'Advanced').should('be.visible');
  });

  it('switches between zone tabs', () => {
    // Click on a zone node
    cy.get('li.list-group-item').contains(/^Zone:/).first().click();

    // Verify explorer title shows zone
    cy.expect_explorer_title('Zone');

    // Click on SmartProxy Affinity tab - re-query each time to handle re-renders
    cy.contains('button', 'SmartProxy Affinity').should('be.visible');
    cy.contains('button', 'SmartProxy Affinity').click();

    // Click on Advanced tab - re-query each time to handle re-renders
    cy.contains('button', 'Advanced').should('be.visible');
    cy.contains('button', 'Advanced').click();

    // Click back to Zone tab - re-query each time to handle re-renders
    cy.contains('button', 'Zone').should('be.visible');
    cy.contains('button', 'Zone').click();

    // Verify we're still on the zone page
    cy.expect_explorer_title('Zone');
  });
});
