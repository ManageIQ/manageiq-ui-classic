/* eslint-disable no-undef */

Cypress.Commands.add('disableAlertsIfVisible', () => {
  // Look for notification popups and disable them if present
  return cy.get('body').then(($body) => {
    const $link = $body.find(
      '.miq-toast-wrapper .row .alert a:contains("Disable notifications")'
    );
    if ($link.length && $link.is(':visible')) {
      cy.wrap($link).click({ force: true });
    }
    return cy.wrap(null);
  });
});

// user: String of username to log in with, default is admin.
// password: String of password to log in with, default is smartvm.
Cypress.Commands.add(
  'login',
  (user = 'admin', password = 'smartvm', options = {}) => {
    const { disableNotifications = false } = options;
    if (disableNotifications) {
      cy.intercept('GET', '/api/notifications').as('getNotifications');
    }
    cy.visit('/');

    cy.get('#user_name').type(user);
    cy.get('#user_password').type(password);
    const triggerLogin = () => cy.get('#login').click();

    if (disableNotifications) {
      return triggerLogin()
        .then(() => cy.wait('@getNotifications'))
        .then(() => cy.disableAlertsIfVisible());
    }
    return triggerLogin();
  }
);
