/* eslint-disable no-undef */

/**
 * Logs a custom error message to Cypress log and then throws an error.
 *
 * @param {string} messageToLog - The message to display in the Cypress command log.
 * @param {string} [messageToThrow] - Optional error message to throw, defaults to messageToLog
 *
 * Usage:
 * cy.logAndThrowError('This is the logged message', 'This is the thrown error message');
 */
Cypress.Commands.add('logAndThrowError', (messageToLog, messageToThrow) => {
  Cypress.log({
    name: 'error',
    displayName: '❗ CypressError:',
    message: messageToLog,
  });
  throw new Error(messageToThrow || messageToLog);
});
