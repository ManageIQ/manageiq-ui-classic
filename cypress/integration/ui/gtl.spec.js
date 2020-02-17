describe('GTL', () => {
  beforeEach(() => {
    cy.login();
  });

  it("with data", () => {
    cy.menu("Configuration");
    cy.get('tr').last().click();
    cy.gtl().should('be.visible');
  });

  it("without data", () => {
    cy.menu("Compute", "Physical Infrastructure", "Chassis");
    cy.gtl_no_record();
  });

  it("click  grid", ()  => {
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.get("div[pf-card-view] > .card-view-pf > .card");
    cy.get('#view_grid').click();
    cy.get("#miq-gtl-view .spinner");
    cy.get("div[pf-card-view] > .card-view-pf > .card");
    cy.gtl_click('2_vcr_liberty');
    cy.get('#textual_summary').should('be.visible');
  });

  it("click  tile", ()  => {
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.get("div[pf-card-view] > .card-view-pf > .card");
    cy.get('#view_tile').click();
    cy.get("#miq-gtl-view .spinner");
    cy.get("div[pf-card-view] > .card-view-pf > .card");
    cy.gtl_click('2_vcr_kilo_keystone_v3');
    cy.get('#textual_summary').should('be.visible');
  });

  it("click  list", ()  => {
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.get("div[pf-card-view] > .card-view-pf > .card");
    cy.get('#view_list').click();
    cy.get("#miq-gtl-view .spinner");
    cy.get("#miq-gtl-view table.miq-table");
    cy.gtl_click('2_vcr_kilo_keystone_v3');
    cy.get('#textual_summary').should('be.visible');
  });
});
