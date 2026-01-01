/* eslint-disable no-undef */

// Look for notification popups and disable them if present
Cypress.Commands.add('closeNotificationsIfVisible', () => {
  cy.get('body').then(($body) => {
    const $link = $body.find(
      '.miq-toast-wrapper .row .alert a:contains("Disable notifications")'
    );
    if ($link.length && $link.is(':visible')) {
      cy.wrap($link).click({ force: true });
    }
  });
});

// Look for a server error pop up and close if visible
Cypress.Commands.add('closeErrorPopupIfVisible', () => {
  cy.get('body').then(($body) => {
    // Check if the error modal is visible
    const $errorModal = $body.find('#errorModal.modal-open');
    if ($errorModal.length) {
      // Click the close button in the modal header
      cy.get('#errorModal .modal-header .close')
        .click({ force: true });
      
      // If that doesn't work, try the close button in the footer
      cy.get('body').then(($updatedBody) => {
        const $stillVisible = $updatedBody.find('#errorModal.modal-open');
        if ($stillVisible.length) {
          cy.get('#errorModal .modal-footer .btn-primary')
            .contains('Close')
            .click({ force: true });
        }
      });
    }
    // else: no error modal is visible, do nothing
  });
});
