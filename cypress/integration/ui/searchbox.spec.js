describe('Search box', () => {
  beforeEach(() => {
    cy.login();
  });

  it("is present", () => {
    cy.menu("Configuration");
    cy.get('div[class=panel-heading]').first().click();
    cy.search_box();
  });

  it("is not present", () => {
    cy.no_search_box();
  });
});
