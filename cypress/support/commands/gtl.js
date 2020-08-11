// GTL related helpers
Cypress.Commands.add("gtl_error", () => {
  return cy.get('#miq-gtl-view > #flash_msg_div').should('be.visible');
});

Cypress.Commands.add("gtl_no_record", () => {
  return cy.get('#miq-gtl-view > div.no-record').should('be.visible');
});

Cypress.Commands.add("gtl", () => {
  cy.get('#miq-gtl-view').then($gtlTile => {
    if ($gtlTile.find("miq-tile-view").length > 0) {
      return cy.get("div[pf-card-view] > .card-view-pf > .card");
    }  else {
      return cy.get('#miq-gtl-view > miq-data-table > div > table');
    };
  });
});

Cypress.Commands.add("gtl_click", (name) => {
  cy.gtl().contains(name).click()
});
