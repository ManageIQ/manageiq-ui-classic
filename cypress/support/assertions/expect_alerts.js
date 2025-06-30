/* eslint-disable no-undef */

/**
 * Custom Cypress command to validate flash messages.
 * @param {string} alertType - Type of alert (success, warning, error, info).
 * @param {string} [containsText] - Optional text that the alert should contain.
 * @returns {Cypress.Chainable} - The alert element if found, or an assertion failure.
 */
Cypress.Commands.add('expect_flash', (alertType = 'success', containsText) => {
  let alertClassName;
  switch (alertType) {
    case 'warning':
      alertClassName = 'warning';
      break;
    case 'error':
      alertClassName = 'danger';
      break;
    case 'info':
      alertClassName = 'info';
      break;
    default:
      alertClassName = 'success';
      break;
  }
  const alert = cy
    .get(`#main_div #flash_msg_div .alert-${alertClassName}`)
    .should('be.visible');

  if (containsText) {
    return alert.should(($el) => {
      const actualText = $el.text().toLowerCase();
      expect(actualText).to.include(containsText.toLowerCase());
    });
  }

  return alert;
});

Cypress.Commands.add(
  'listen_for_browser_confirm_alert',
  (containsText, proceed = true) => {
    cy.on('window:confirm', (actualText) => {
      if (containsText) {
        expect(actualText.toLowerCase()).to.include(containsText.toLowerCase());
      }
      return proceed; // true = OK, false = Cancel
    });
  }
);
