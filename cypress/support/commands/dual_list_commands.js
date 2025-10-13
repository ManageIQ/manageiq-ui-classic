/* eslint-disable no-undef */
/**
 * @fileoverview
 * This file contains Cypress commands for interacting with dual-list components.
 * A dual-list component consists of two lists where items can be moved between them
 * using add/remove buttons.
 */
import { DUAL_LIST_ACTION_TYPE } from './constants/command_constants';

// CSS selectors for dual-list component elements
const DUAL_LIST_BODY_SELECTOR =
  'fieldset.bx--fieldset .bx--structured-list-tbody';
const DUAL_LIST_OPTION_ROW_SELECTOR = '.bx--structured-list-row';

/**
 * Command to perform actions on a dual list component.
 * This command allows you to:
 * - Add selected items from the left list to the right list
 * - Remove selected items from the right list to the left list
 * - Add all items from the left list to the right list
 * - Remove all items from the right list to the left list
 *
 * @param {Object} options - Parameters for the action
 * @param {string} options.actionType - Type of action to perform. Use values from DUAL_LIST_ACTION_TYPE:
 *   - DUAL_LIST_ACTION_TYPE.ADD: Move selected items from left to right
 *   - DUAL_LIST_ACTION_TYPE.REMOVE: Move selected items from right to left
 *   - DUAL_LIST_ACTION_TYPE.ADD_ALL: Move all items from left to right
 *   - DUAL_LIST_ACTION_TYPE.REMOVE_ALL: Move all items from right to left
 * @param {Array<string>} [options.optionsToSelect] - Array of option texts to select
 *   (required for 'add' and 'remove' actions, not needed for 'add-all' and 'remove-all')
 *
 * @example
 * // Add specific items from left to right
 * cy.dualListAction({
 *   actionType: DUAL_LIST_ACTION_TYPE.ADD,
 *   optionsToSelect: ['Option 1', 'Option 2']
 * });
 *
 * @example
 * // Remove specific items from right to left
 * cy.dualListAction({
 *   actionType: DUAL_LIST_ACTION_TYPE.REMOVE,
 *   optionsToSelect: ['Option 3']
 * });
 *
 * @example
 * // Add all items from left to right
 * cy.dualListAction({
 *   actionType: DUAL_LIST_ACTION_TYPE.ADD_ALL
 * });
 *
 * @example
 * // Remove all items from right to left
 * cy.dualListAction({
 *   actionType: DUAL_LIST_ACTION_TYPE.REMOVE_ALL
 * });
 */
Cypress.Commands.add('dualListAction', ({ actionType, optionsToSelect }) => {
  if (!actionType) {
    cy.logAndThrowError('actionType is required');
  }

  const validActionTypes = Object.values(DUAL_LIST_ACTION_TYPE);
  if (!validActionTypes.includes(actionType)) {
    cy.logAndThrowError(
      `Action type "${actionType}" not supported. Valid action types are: ${validActionTypes.join(
        ', '
      )}`
    );
  }

  const isActionTypeAddAll = actionType === DUAL_LIST_ACTION_TYPE.ADD_ALL;
  if (isActionTypeAddAll || actionType === DUAL_LIST_ACTION_TYPE.REMOVE_ALL) {
    const targetButtonId = isActionTypeAddAll
      ? '#move-all-right'
      : '#move-all-left';

    return cy.get(targetButtonId).click();
  }

  const isActionTypeAdd = actionType === DUAL_LIST_ACTION_TYPE.ADD;
  if (isActionTypeAdd || actionType === DUAL_LIST_ACTION_TYPE.REMOVE) {
    if (!optionsToSelect || !optionsToSelect.length) {
      cy.logAndThrowError(
        'optionsToSelect array is required for add and remove actions'
      );
    }

    const targetListIndex = isActionTypeAdd ? 'first' : 'last';
    const targetButtonId = isActionTypeAdd ? '#move-right' : '#move-left';
    optionsToSelect.forEach((option) => {
      cy.get(DUAL_LIST_BODY_SELECTOR)
        [targetListIndex]()
        .contains(DUAL_LIST_OPTION_ROW_SELECTOR, option)
        .click();
    });
    cy.get(targetButtonId).click();
  }
});
