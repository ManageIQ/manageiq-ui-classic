/* eslint-disable no-undef */

/**
 * Custom command to get the intercepted API aliases stored in Cypress environment variables.
 * This command returns the object containing all registered API interception aliases.
 * 
 * @returns {Object} An object where keys are in format method-alias(e.g. post-myApiAlias) and values are typically the same alias names
 * @example
 * cy.getInterceptedApiAliases().then((aliases) => {
 *   Check if a specific alias exists
 *   expect(aliases).to.have.property('post-myApiAlias');
 *
 *   Get the number of registered aliases
 *   const aliasCount = Object.keys(aliases).length;
 * });
 */
Cypress.Commands.add('getInterceptedApiAliases', () =>
  Cypress.env('interceptedAliases')
);

/**
 * Custom command to set an intercepted API alias in the Cypress environment variables.
 * This command adds an alias in the intercepted aliases tracking object.
 *
 * @param {string} aliasKey - The key/name of the alias to set
 * @param {string} [aliasValue=aliasKey] - The value to store for the alias (defaults to the same as the key)
 * @example
 * Set a new alias
 * cy.setInterceptedApiAlias('getUsersApi');
 *
 * Set an alias with a custom value
 * cy.setInterceptedApiAlias('getUsersApi', 'customValue');
 */
Cypress.Commands.add(
  'setInterceptedApiAlias',
  (aliasKey, aliasValue = aliasKey) => {
    cy.getInterceptedApiAliases().then((interceptedAliasesMap) => {
      interceptedAliasesMap[aliasKey] = aliasValue;
      Cypress.env('interceptedAliases', interceptedAliasesMap);
    });
  }
);

/**
 * Custom command to reset all intercepted API aliases stored in Cypress environment variables.
 * This command clears the tracking object by setting it to an empty object.
 * Useful for cleaning up between tests or test suites.
 * @example
 * Reset all intercepted API aliases
 * cy.resetInterceptedApiAliases();
 */
Cypress.Commands.add('resetInterceptedApiAliases', () =>
  Cypress.env('interceptedAliases', {})
);

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
    cy.getInterceptedApiAliases().then((interceptedAliasesMap) => {
      const aliasObjectKey = `${method.toLowerCase()}-${alias}`;
      // Check if this request is already registered
      const isAlreadyRegistered = !!interceptedAliasesMap[aliasObjectKey];

      // Register the intercept if not already done
      if (!isAlreadyRegistered) {
        cy.intercept(method, urlPattern).as(alias);
        cy.setInterceptedApiAlias(aliasObjectKey, alias);
      }

      // Execute the function that triggers the API call
      triggerFn();

      // Wait for the intercepted request to complete
      cy.wait(`@${alias}`).then((interception) => {
        onApiResponse(interception);
      });
    });
  }
);
