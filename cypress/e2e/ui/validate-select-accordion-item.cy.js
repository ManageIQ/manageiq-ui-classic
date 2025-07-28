/* eslint-disable no-undef */

describe('Validate select accordion item', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Settings', 'Application Settings');
  });

  it('should search nodes only within expanded tree', () => {
    // expand Diagnostics tree
    cy.accordion('Diagnostics');
    // should open the path under Diagnostics even if
    // an identical one exists under Settings
    cy.selectAccordionItem([
      /^ManageIQ Region:/,
      /^Zone:/,
      /^Server:/,
    ]);
  });

  it('should fail when an invalid node label is passed', (done) => {
    cy.accordion('Access Control');

    cy.on('fail', (err) => {
      expect(err.message).to.include('not found');
      done();
    });

    cy.selectAccordionItem([
      'ManageIQ Region: Region 0 [0]',
      'Tenants',
      'No Company', // This label does not exist
    ]);
  });

  it('should support path arrays containing both exact strings and regex patterns', () => {
    cy.accordion('Settings');
    cy.selectAccordionItem([
      /^ManageIQ Region/,
      'Zones',
      /^Zone: Default/,
      'Server: EVM [1] (current)',
    ]);
  });

  it('should not collapse already expanded node', () => {
    cy.accordion('Settings');
    cy.selectAccordionItem([
      /^ManageIQ Region/,
      'Zones',
      /^Zone: Default/,
      'Server: EVM [1] (current)',
    ]);
    // Above path is already expanded, so this should not collapse it
    cy.selectAccordionItem([
      /^ManageIQ Region/,
      'Zones',
      /^Zone: Default/,
      'Server: EVM [1] (current)',
    ]);
  });
});
