// TODO: Use aliased import(@cypress-dir) once #9631 is merged
import { LABEL_CONFIG_KEYS } from './constants/command_constants.js';

/**
 * Helper function to validate that config objects only contain valid keys
 *
 * @param {Object} config - The configuration object to validate
 * @param {Object} validKeysObject - The object containing valid keys (e.g., LABEL_CONFIG_KEYS)
 * @param {string} configType - The type of configuration being validated (for error messages)
 */
const validateConfigKeys = (config, validKeysObject, configType) => {
  const validKeys = Object.values(validKeysObject);
  
  Object.keys(config).forEach(key => {
    if (!validKeys.includes(key)) {
      cy.logAndThrowError(
        `Unknown key "${key}" in ${configType} config. Valid keys are: ${validKeys.join(', ')}`
      );
    }
  });
};

/**
 * Validates form field labels based on provided configurations
 *
 * @param {Array} labelConfigs - Array of label configuration objects
 * @param {string} labelConfigs[].forValue - The 'for' attribute value of the label
 * @param {string} [labelConfigs[].expectedText] - The expected text content of the label
 *
 * Example:
 *   cy.validateFormLabels([
 *     { [LABEL_CONFIG_KEYS.FOR_VALUE]: 'name', [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'Name' },
 *     { [LABEL_CONFIG_KEYS.FOR_VALUE]: 'email', [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'Email Address' }
 *   ]);
 *
 * Or using regular object keys:
 *   cy.validateFormLabels([
 *     { forValue: 'name', expectedText: 'Name' },
 *     { forValue: 'email', expectedText: 'Email Address' }
 *   ]);
 *
 * Both approaches work but using config-keys object(LABEL_CONFIG_KEYS) is recommended to avoid typos and unknown keys
 */
Cypress.Commands.add('validateFormLabels', (labelConfigs) => {
  if (!Array.isArray(labelConfigs)) {
    cy.logAndThrowError('labelConfigs must be an array');
  }

  if (!labelConfigs.length) {
    cy.logAndThrowError('labelConfigs array cannot be empty');
  }

  labelConfigs.forEach((config) => {
    validateConfigKeys(config, LABEL_CONFIG_KEYS, 'label');

    const forValue = config[LABEL_CONFIG_KEYS.FOR_VALUE];
    const expectedText = config[LABEL_CONFIG_KEYS.EXPECTED_TEXT];

    if (!forValue) {
      cy.logAndThrowError(
        `${LABEL_CONFIG_KEYS.FOR_VALUE} is required for each label config`
      );
    }

    const labelCheck = cy
      .getFormLabelByForAttribute({ forValue })
      .should('be.visible');

    if (expectedText) {
      labelCheck.and('contain.text', expectedText);
    }
  });
});
