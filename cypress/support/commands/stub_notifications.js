Cypress.Commands.add('stub_notifications', () => {
    cy.intercept('GET', '/api/notifications', (req) => {
      req.reply({fixture: 'empty_notifications.json'});
    });

    cy.intercept('GET', '/api/notifications?expand=resources&attributes=details*', (req) => {
      req.reply({fixture: 'empty_notifications_expanded.json'});
    });
});
