// TODO: Use aliased import(@cypress-dir) once #9631 is merged
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  FIELD_TYPES,
  BUTTON_CONFIG_KEYS,
} from './constants/command_constants.js';

/**
 * Helper function to validate that config objects only contain valid keys
 *
 * @param {Object} config - The configuration object to validate
 * @param {Object} validKeysObject - The object containing valid keys (e.g., LABEL_CONFIG_KEYS)
 * @param {string} configType - The type of configuration being validated (for error messages)
 */
const validateConfigKeys = (config, validKeysObject, configType) => {
  const validKeys = Object.values(validKeysObject);

  Object.keys(config).forEach((key) => {
    if (!validKeys.includes(key)) {
      cy.logAndThrowError(
        `Unknown key "${key}" in ${configType} config. Valid keys are: ${validKeys.join(
          ', '
        )}`
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

/**
 * Validates form input fields based on provided configurations
 *
 * @param {Array} fieldConfigs - Array of field configuration objects
 * @param {string} fieldConfigs[].id - The ID of the form field
 * @param {string} [fieldConfigs[].fieldType='input'] - The type of field ('input', 'select', 'textarea')
 * @param {string} [fieldConfigs[].inputFieldType='text'] - The type of input field ('text', 'password', 'number')
 * @param {boolean} [fieldConfigs[].shouldBeDisabled=false] - Whether the field should be disabled
 * @param {string} [fieldConfigs[].expectedValue] - The expected value of the field
 *
 * Example:
 *   cy.validateFormFields([
 *     { [FIELD_CONFIG_KEYS.ID]: 'name', [FIELD_CONFIG_KEYS.SHOULD_BE_DISABLED]: true },
 *     { [FIELD_CONFIG_KEYS.ID]: 'email', [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'email' },
 *     {
 *       [FIELD_CONFIG_KEYS.ID]: 'role',
 *       [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
 *       [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: 'admin'
 *     }
 *   ]);
 *
 * Or using regular object keys:
 *   cy.validateFormFields([
 *     { id: 'name', shouldBeDisabled: true },
 *     { id: 'email' },
 *     { id: 'role', fieldType: 'select', expectedValue: 'admin' }
 *   ]);
 *
 * Both approaches work but using config-keys object(FIELD_CONFIG_KEYS) is recommended to avoid typos and unknown keys
 */
Cypress.Commands.add('validateFormFields', (fieldConfigs) => {
  if (!Array.isArray(fieldConfigs)) {
    cy.logAndThrowError('fieldConfigs must be an array');
  }

  if (!fieldConfigs.length) {
    cy.logAndThrowError('fieldConfigs array cannot be empty');
  }

  fieldConfigs.forEach((config) => {
    validateConfigKeys(config, FIELD_CONFIG_KEYS, 'field');

    const id = config[FIELD_CONFIG_KEYS.ID];
    const fieldType = config[FIELD_CONFIG_KEYS.FIELD_TYPE] || FIELD_TYPES.INPUT;
    const inputFieldType = config[FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE] || 'text';
    const shouldBeDisabled =
      config[FIELD_CONFIG_KEYS.SHOULD_BE_DISABLED] || false;
    const expectedValue = config[FIELD_CONFIG_KEYS.EXPECTED_VALUE];

    if (!id) {
      cy.logAndThrowError(
        `${FIELD_CONFIG_KEYS.ID} is required for each field config`
      );
    }

    // Check field based on type
    switch (fieldType) {
      case FIELD_TYPES.INPUT:
        cy.getFormInputFieldByIdAndType({
          inputId: id,
          inputType: inputFieldType,
        })
          .should('be.visible')
          .then((field) => {
            if (shouldBeDisabled) {
              expect(field).to.be.disabled;
            } else {
              expect(field).to.not.be.disabled;
            }

            if (expectedValue) {
              cy.wrap(field).should('have.value', expectedValue);
            }

            if (inputFieldType === 'checkbox') {
              const shouldBeChecked =
                config[FIELD_CONFIG_KEYS.SHOULD_BE_CHECKED] || false;
              if (shouldBeChecked) {
                expect(field).to.be.checked;
              } else {
                expect(field).to.not.be.checked;
              }
            }
          });
        break;
      case FIELD_TYPES.SELECT:
        cy.getFormSelectFieldById({ selectId: id })
          .should('be.visible')
          .then((field) => {
            if (shouldBeDisabled) {
              expect(field).to.be.disabled;
            } else {
              expect(field).to.not.be.disabled;
            }

            if (expectedValue) {
              cy.wrap(field).should('have.value', expectedValue);
            }
          });
        break;
      case FIELD_TYPES.TEXTAREA:
        cy.getFormTextareaById({ textareaId: id })
          .should('be.visible')
          .then((field) => {
            if (shouldBeDisabled) {
              expect(field).to.be.disabled;
            } else {
              expect(field).to.not.be.disabled;
            }

            if (expectedValue) {
              cy.wrap(field).should('have.value', expectedValue);
            }
          });
        break;

      default:
        cy.logAndThrowError(`Unsupported field type: ${fieldType}`);
    }
  });
});

/**
 * Validates form buttons based on provided configurations
 *
 * @param {Array} buttonConfigs - Array of button configuration objects
 * @param {string} buttonConfigs[].buttonText - The text of the button
 * @param {string} [buttonConfigs[].buttonType='button'] - The type of button (e.g., 'submit', 'reset')
 * @param {boolean} [buttonConfigs[].shouldBeDisabled=false] - Whether the button should be disabled
 *
 * Example:
 *   cy.validateFormButtons([
 *     { [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Cancel' },
 *     { [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Reset', [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true },
 *     { [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Submit', [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit' },
 *     { [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Save', [BUTTON_CONFIG_KEYS.BUTTON_WRAPPER_CLASS]: 'custom-wrapper' }
 *   ]);
 *
 * Or using regular object keys:
 *   cy.validateFormButtons([
 *     { buttonText: 'Cancel' },
 *     { buttonText: 'Reset', shouldBeDisabled: true },
 *     { buttonText: 'Submit', buttonType: 'submit' },
 *   ]);
 *
 * Both approaches work but using config-keys object(BUTTON_CONFIG_KEYS) is recommended to avoid typos and unknown keys
 */
Cypress.Commands.add('validateFormButtons', (buttonConfigs) => {
  if (!Array.isArray(buttonConfigs)) {
    cy.logAndThrowError('buttonConfigs must be an array');
  }

  if (!buttonConfigs.length) {
    cy.logAndThrowError('buttonConfigs array cannot be empty');
  }

  buttonConfigs.forEach((config) => {
    validateConfigKeys(config, BUTTON_CONFIG_KEYS, 'button');

    const buttonText = config[BUTTON_CONFIG_KEYS.BUTTON_TEXT];
    const buttonType = config[BUTTON_CONFIG_KEYS.BUTTON_TYPE] || 'button';
    const shouldBeDisabled =
      config[BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED] || false;

    if (!buttonText) {
      cy.logAndThrowError(
        `${BUTTON_CONFIG_KEYS.BUTTON_TEXT} is required for each button config`
      );
    }

    const buttonCheck = cy
      .getFormButtonByTypeWithText({
        buttonText,
        buttonType,
      })
      .scrollIntoView()
      .should('be.visible');

    if (shouldBeDisabled) {
      buttonCheck.and('be.disabled');
    } else {
      buttonCheck.and('be.enabled');
    }
  });
});
