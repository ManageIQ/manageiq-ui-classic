describe('GTL', () => {
  beforeEach(() => {
    cy.login();
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
});
