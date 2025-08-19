/* eslint-disable no-undef */

/**
 * Custom command to intercept API calls and wait for them to complete.
 * This command will:
 * 1. Register an intercept for the given alias and URL pattern if not already registered
 * 2. Execute the trigger function that makes the API call
 * 3. Wait for the intercepted request to complete if it was triggered
 *
 * @param {Object} options - The options for the intercept
 * @param {string} options.alias - Unique alias for this interception
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {string|RegExp} options.urlPattern - URL pattern to intercept
 * @param {Function} options.triggerFn - Function that triggers the API call
 * @param {Function} [options.onApiResponse] - Optional callback function that receives the interception object after the API call completes.
 * Use this to perform assertions on the response, extract data, or perform additional actions based on the API result.
 * Default is a no-op function. e.g. { onApiResponse: (interception) => { expect(interception.response.statusCode).to.equal(200); } }
 */
Cypress.Commands.add(
  'interceptApi',
  ({
    alias,
    method = 'POST',
    urlPattern,
    triggerFn,
    onApiResponse = () => {
      /* default implementation */
    },
  }) => {
    /* ===== TODO: Remove this block once interceptApi command becomes stable ===== */
    const envVars = Cypress.env();
    cy.log('Cypress Environment Variables:');
    cy.log(JSON.stringify(envVars, null, 2));
    /* ======================================================= */

    // Check if this request is already registered
    const isAlreadyRegistered = !!Cypress.env('interceptedAliases')[alias];

    // Register the intercept if not already done
    if (!isAlreadyRegistered) {
      cy.intercept(method, urlPattern).as(alias);

      // Store the alias in the tracking object
      const interceptedAliases = Cypress.env('interceptedAliases');
      interceptedAliases[alias] = alias;
      Cypress.env('interceptedAliases', interceptedAliases);
    }

    // Execute the function that triggers the API call
    triggerFn();

    // Wait for the intercepted request to complete
    cy.wait(`@${alias}`).then((interception) => {
      onApiResponse(interception);
    });
  }
);
