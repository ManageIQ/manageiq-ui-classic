/* eslint-disable no-undef */

// user: String of username to log in with, default is admin.
// password: String of password to log in with, default is smartvm.
// options: Object with optional parameters:
//   - cached: Boolean, if true uses cy.session() to cache login state (default: false)
//
// Usage:
//   cy.login();                           // Original behavior - no caching
//   cy.login('admin', 'smartvm');         // Original behavior - no caching
//   cy.login('admin', 'smartvm', { cached: true });  // Cached login
//
// Cached login benefits:
//   - First test: Performs full login (~600ms cold start)
//   - Subsequent tests: Reuses cached session (~0ms for login)
//   - Saves ~200ms per test after the first test
//   - Real API calls: Tests actual authentication behavior
Cypress.Commands.add('login', (user = 'admin', password = 'smartvm', options = {}) => {
  const { cached = false } = options;

  if (cached) {
    // Use cy.session() to cache login state
    cy.session(
      [user, password], // Session ID based on credentials
      () => {
        // This block only runs once per unique user/password combination
        cy.visit('/');
        cy.get('#user_name').type(user);
        cy.get('#user_password').type(password);
        cy.get('#login').click();

        // Wait for successful login (app redirects to /utilization or /dashboard)
        cy.url().should('match', /\/(utilization|dashboard)/);
      },
      {
        validate() {
          // Verify the session is still valid before reusing it
          cy.request('/api/auth?requester_type=ui').its('status').should('eq', 200);
        },
        cacheAcrossSpecs: true, // Share session across different test files
      }
    );
  } else {
    // Original behavior - no caching
    cy.visit('/');
    cy.get('#user_name').type(user);
    cy.get('#user_password').type(password);
    return cy.get('#login').click();
  }
});

