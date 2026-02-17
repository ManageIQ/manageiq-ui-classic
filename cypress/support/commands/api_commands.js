/* eslint-disable no-undef */

/**
 * Custom command to get the intercepted API aliases stored in Cypress exposed data.
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
  Cypress.expose('interceptedAliases') || {}
);

/**
 * Custom command to set an intercepted API alias in the Cypress exposed data.
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
    const interceptedAliasesMap = Cypress.expose('interceptedAliases') || {};
    interceptedAliasesMap[aliasKey] = aliasValue;
    Cypress.expose('interceptedAliases', interceptedAliasesMap);
  }
);

/**
 * Custom command to reset all intercepted API aliases stored in Cypress exposed data.
 * This command clears the tracking object by setting it to an empty object.
 * Useful for cleaning up between tests or test suites.
 * @example
 * Reset all intercepted API aliases
 * cy.resetInterceptedApiAliases();
 */
Cypress.Commands.add('resetInterceptedApiAliases', () =>
  Cypress.expose('interceptedAliases', {})
);

/**
 * Sets the request interception flag in Cypress exposed data.
 * This flag is used to track whether a request matching an intercept pattern was detected.
 *
 * @param {boolean} value - The value to set for the flag (true if request was intercepted, false otherwise)
 * @example
 * // Mark a request as intercepted
 * setRequestIntercepted(true);
 *
 * // Reset the interception flag
 * setRequestIntercepted(false);
 */
const setRequestIntercepted = (value) =>
  Cypress.expose('wasRequestIntercepted', value);

/**
 * Gets the current value of the request interception flag from Cypress exposed data.
 * This flag indicates whether a request matching an intercept pattern was detected.
 * @returns {boolean} The current value of the request interception flag, by default returns false
 */
const getRequestIntercepted = () =>
  Cypress.expose('wasRequestIntercepted') || false;

/**
 * Custom command to intercept API calls and wait for them to complete.
 * This command will:
 * 1. Register an intercept for the given alias and URL pattern if not already registered
 * 2. Execute the trigger function that makes the API call
 * 3. Wait for the intercepted request to complete if it was triggered
 *
 * @param {Object} options - The options for the intercept
 * @param {string} options.alias - Unique alias for this interception
 * @param {string} [options.method] - HTTP method (default: 'POST')
 * @param {string|RegExp} options.urlPattern - URL pattern to intercept
 * @param {boolean} [options.waitOnlyIfRequestIntercepted] - When set to true(default: false), the command will only wait for the response
 * if the request was actually intercepted. This is useful for conditional API calls that may or may not happen like in tree navigations.
 * If false (default), the command will always wait for the intercepted request, where a request is always expected (e.g., button events).
 * @param {Function} options.triggerFn - Function that triggers the API call. e.g. { triggerFn: () => { cy.get('button').click(); } }
 * @param {Function} [options.responseInterceptor] - Optional function that can modify the response before it's returned to the application.
 * This function receives the request object and can handle the response in different ways:
 * 1. req.reply({body: {...}}) - Immediately respond with a stubbed response (request never goes to origin)
 * 2. req.continue() - Let the request go to the origin server without modification
 * 3. req.continue((res) => { res.send({...}) }) - Let the request go to origin, then modify the response
 * Examples:
 * - Stub response: { responseInterceptor: (req) => req.reply({ body: { customData: 'value' } }) }
 * - Using fixture to stub response: { responseInterceptor: (req) => req.reply({ fixture: 'users.json' }) }
 * - Pass through to origin: { responseInterceptor: (req) => req.continue() }
 * - Modify origin response: { responseInterceptor: (req) => req.continue((res) => { res.send(200, { modified: true }) }) }
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
    waitOnlyIfRequestIntercepted = false,
    triggerFn,
    onApiResponse = () => {
      /* default implementation */
    },
    responseInterceptor = () => {
      /* default implementation */
    },
  }) => {
    /* ===== TODO: Remove this block once interceptApi command becomes stable ===== */
    const exposedData = {
      interceptedAliases: Cypress.expose('interceptedAliases'),
      wasRequestIntercepted: Cypress.expose('wasRequestIntercepted')
    };
    cy.log('Cypress Exposed Data:');
    cy.log(JSON.stringify(exposedData, null, 2));
    /* ======================================================= */

    // Check if this request is already registered
    const interceptedAliasesMap = Cypress.expose('interceptedAliases') || {};
    const aliasObjectKey = `${method.toLowerCase()}-${alias}`;
    // Check if this request is already registered
    const isAlreadyRegistered = !!interceptedAliasesMap[aliasObjectKey];
    // Setting wasRequestIntercepted flag to false initially
    setRequestIntercepted(false);
    // Register the intercept if not already done
    if (!isAlreadyRegistered) {
      cy.intercept(method, urlPattern, (req) => {
        // Setting wasRequestIntercepted flag to true after request is intercepted
        if (waitOnlyIfRequestIntercepted) {
          setRequestIntercepted(true);
        }
        responseInterceptor(req);
      }).as(alias);
      cy.setInterceptedApiAlias(aliasObjectKey, alias);
    }

    // Execute the function that triggers the API call
    triggerFn();

    // Wait for the intercepted request to complete
    cy.then(() => {
      // If waitOnlyIfRequestIntercepted is true, check if the request was intercepted
      // and then wait for the response
      if (waitOnlyIfRequestIntercepted) {
        const isRequestIntercepted = getRequestIntercepted();
        if (isRequestIntercepted) {
          cy.wait(`@${alias}`).then(onApiResponse);
        }
      }
      // If waitOnlyIfRequestIntercepted is not required then directly wait for the response
      else {
        cy.wait(`@${alias}`).then(onApiResponse);
      }
    });
  }
);
