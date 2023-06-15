/* eslint-disable no-undef */

describe('Login / Logout', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // do not use cy.login() here
  it('Login page', () => {
    cy.get('#user_name')
      .type('admin');
    cy.get('#user_password')
      .type('smartvm');
    cy.get('#login').click();

    cy.get('.navbar-brand-name');
  });

  it('Logout button', () => {
    cy.login();
    cy.intercept('GET', '/api/auth?requester_type=ws').as('get');
    cy.get('#menu_item_logout').click();

    cy.get('@get').then((getCall) => {
      expect(getCall.state).to.equal('Complete');
      expect(getCall.response).to.include({
        statusCode: 401,
      });
    });

    cy.url().then((url) => {
      expect(url).to.equal('http://localhost:3000/#/');
    });
  });
});
