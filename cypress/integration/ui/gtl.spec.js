describe('GTL', () => {
  beforeEach(() => {
    cy.login();
    cy.server();
  });

  it("with data", () => {
    cy.menu("Configuration");
    cy.get('tr').last().click();
    cy.gtl();
  });

  it("without data", () => {
    cy.menu("Compute", "Physical Infrastructure", "Chassis");
    cy.gtl_no_record();
  });

  // TODO Grid  Tile List click - universal click ?
  it("click  grid", ()  => {
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.get("#spinner_div > div").should('not.be.visible');
    cy.route('/vm_infra/report_data/*').as('switchGtlBeta');
    cy.get('#view_grid').click();
    cy.get("#spinner_div > div").should('not.be.visible');
    cy.wait('@switchGtlBeta');
    cy.gtl_grid_click('2_vcr_liberty');
    cy.get('#textual_summary').should('be.visible');
  });

  it("click  tile", ()  => {
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.get('#view_tile').click();
    cy.wait('@switchGtl');
    cy.gtl_tile_click('2_vcr_kilo_keystone_v3');
    cy.get('#textual_summary').should('be.visible');
  });
  it("click  list", ()  => {
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.get('#view_list').click();
    cy.wait('@switchGtl');
    cy.gtl_list_click('2_vcr_kilo_keystone_v3');
    cy.get('#textual_summary').should('be.visible');
  });
});
