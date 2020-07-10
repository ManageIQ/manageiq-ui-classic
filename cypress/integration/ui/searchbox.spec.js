describe('Search box', () => {
  beforeEach(() => {
    cy.login();
  });

  it("is present", () => {
    cy.menu("Overview", "Dashboard");
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.get('div[class=panel-heading]').first().click();
    cy.search_box();
  });

  it("is not present", () => {
    cy.menu("Overview", "Dashboard");
    cy.no_search_box();
  });
});
