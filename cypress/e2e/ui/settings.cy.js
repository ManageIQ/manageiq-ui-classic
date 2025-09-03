/* eslint-disable no-undef */
describe('Settings > My Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Settings', 'My Settings');
  });

  it('Saves the start page setting', () => {
    cy.get('#display\\.startpage').then((value) => {
      expect(value[0].value).to.be.oneOf(['', 'Overview / Dashboard']);
    });
    cy.changeSelect('display\\.startpage', 'Overview / Utilization');
    cy.intercept('PATCH', '/api/users/*').as('settingsUpdate');
    cy.contains('button', 'Save').click();
    cy.wait('@settingsUpdate').its('response.statusCode').should('eq', 200);

    // Wait for page to load before clicking log out to prevent errors
    cy.get('[name="general-subform"] > :nth-child(2) > .bx--select');
    cy.get('#menu_item_logout').click();
    cy.login();
    cy.url().should('include', '/utilization');

    cy.menu('Settings', 'My Settings');
    cy.get('#display\\.startpage').then((value) => {
      expect(value[0].value).to.equal('Overview / Utilization');
    });
    cy.changeSelect('display\\.startpage', 'Overview / Dashboard');
    cy.intercept('PATCH', '/api/users/*').as('settingsUpdate');
    cy.contains('button', 'Save').click();
    cy.wait('@settingsUpdate').its('response.statusCode').should('eq', 200);

    cy.get('[name="general-subform"] > :nth-child(2) > .bx--select');
    cy.get('#menu_item_logout').click();
    cy.login();
    cy.url().should('include', '/dashboard');
  });
});
