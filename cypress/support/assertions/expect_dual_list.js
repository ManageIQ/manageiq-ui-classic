/* eslint-disable no-undef */
import { DUAL_LIST_ACTION_TYPE } from '../commands/constants/command_constants';

/**
 * @fileoverview
 * This file contains the Cypress command for testing dual-list components.
 * A dual-list component consists of two lists where items can be moved between them
 * using add/remove buttons. This command tests all aspects of the dual-list functionality
 * including item selection, moving items between lists, and search functionality.
 */

// CSS selectors for dual-list component elements
const DUAL_LIST_BODY_SELECTOR =
  'fieldset.cds--fieldset .cds--structured-list-tbody';
const DUAL_LIST_ROW_SELECTOR = '.cds--structured-list-row';
const SEARCH_INPUT_FIELD_SELECTOR = 'fieldset.cds--fieldset .cds--search-input';

/**
 * Selects and moves a single item between lists
 *
 * @param {string} direction - The direction to move ('leftToRight' or 'rightToLeft')
 * @param {string} targetItem - The text of the target item to select and move
 * @returns {void}
 */
function selectAndMoveItem(direction, targetItem) {
  const isLeftToRight = direction === 'leftToRight';
  const sourceIndex = isLeftToRight ? 'first' : 'last';
  const targetIndex = isLeftToRight ? 'last' : 'first';

  const action = isLeftToRight
    ? DUAL_LIST_ACTION_TYPE.ADD
    : DUAL_LIST_ACTION_TYPE.REMOVE;
  cy.dualListAction({
    actionType: action,
    optionsToSelect: [targetItem],
  });

  // Verify the item moved correctly
  cy.get(DUAL_LIST_BODY_SELECTOR)[targetIndex]().should('contain', targetItem);
  cy.get(DUAL_LIST_BODY_SELECTOR)
    [sourceIndex]()
    .should('not.contain', targetItem);
}

/**
 * Verifies that a list contains all the specified list items
 *
 * @param {string} listIndex - The target list to verify ('first' for left list, 'last' for right list)
 * @param {string[]} listItems - Array of list items to validate
 * @returns {Cypress.Chainable} - The Cypress chainable object
 */
function assertListItems(listIndex, listItems) {
  return cy
    .get(DUAL_LIST_BODY_SELECTOR)
    [listIndex]()
    .within(() => {
      listItems.forEach((item) => {
        cy.contains(DUAL_LIST_ROW_SELECTOR, item)
          .scrollIntoView()
          .should('be.visible');
      });
    });
}

/**
 * Moves all items from one list to another and verifies the result
 *
 * @param {string} direction - The direction to move ('leftToRight' or 'rightToLeft')
 * @param {string[]} listItems - Array of list items to move and verify
 * @returns {void}
 */
function moveAllItems(direction, listItems) {
  const isLeftToRight = direction === 'leftToRight';
  const action = isLeftToRight
    ? DUAL_LIST_ACTION_TYPE.ADD_ALL
    : DUAL_LIST_ACTION_TYPE.REMOVE_ALL;
  cy.dualListAction({
    actionType: action,
  });

  const sourceIndex = isLeftToRight ? 'first' : 'last';
  const targetIndex = isLeftToRight ? 'last' : 'first';
  // Verify all items are in the target list
  assertListItems(targetIndex, listItems);
  // Verify source list is empty
  cy.get(DUAL_LIST_BODY_SELECTOR)
    [sourceIndex]()
    .within(() => {
      listItems.forEach((item) => {
        cy.get(DUAL_LIST_ROW_SELECTOR).should('not.contain', item);
      });
    });
}

/**
 * Tests the search functionality of a list
 *
 * @param {string} list - The list to test ('left' or 'right')
 * @param {string} targetItem - The target item text to search for
 * @returns {void}
 */
function testSearchFunctionality(list, targetItem) {
  const listIndex = list === 'left' ? 'first' : 'last';
  const searchIndex = list === 'left' ? 'first' : 'last';

  // Test with valid search term
  cy.get(SEARCH_INPUT_FIELD_SELECTOR)[searchIndex]().type(targetItem);
  cy.get(DUAL_LIST_BODY_SELECTOR)[listIndex]().should('contain', targetItem);
  cy.get(SEARCH_INPUT_FIELD_SELECTOR)[searchIndex]().clear();

  // Test with invalid search term
  const randomText = 'r@nd0m-it3m';
  cy.get(SEARCH_INPUT_FIELD_SELECTOR)[searchIndex]().type(randomText);
  cy.get(DUAL_LIST_BODY_SELECTOR)
    [listIndex]()
    .should('not.contain', targetItem);
  cy.get(SEARCH_INPUT_FIELD_SELECTOR)[searchIndex]().clear();
}

/**
 * Tests the left-to-right flow of the dual-list component
 * This flow assumes items start in the left list and tests moving them to the right and back
 *
 * @param {string[]} initialAvailableItems - Array of available items texts to test with
 * @returns {void}
 */
function testDualListStartingFromAvailableItems(initialAvailableItems) {
  // Test moving a single item from left to right and back
  selectAndMoveItem('leftToRight', initialAvailableItems[0]);
  selectAndMoveItem('rightToLeft', initialAvailableItems[0]);
  // Test moving all items from left to right
  moveAllItems('leftToRight', initialAvailableItems);
  // Test search functionality on right list
  testSearchFunctionality('right', initialAvailableItems[0]);
  // Test moving all items from right to left
  moveAllItems('rightToLeft', initialAvailableItems);
  // Test search functionality on left list
  testSearchFunctionality('left', initialAvailableItems[0]);
}

/**
 * Tests the right-to-left flow of the dual-list component
 * This flow assumes items start in the right list and tests moving them to the left and back
 *
 * @param {string[]} initialSelectedItems - Array of selected items texts to test with
 * @returns {void}
 */
function testDualListStartingFromSelectedItems(initialSelectedItems) {
  // Test moving a single item from right to left and back
  selectAndMoveItem('rightToLeft', initialSelectedItems[0]);
  selectAndMoveItem('leftToRight', initialSelectedItems[0]);
  // Test moving all items from right to left
  moveAllItems('rightToLeft', initialSelectedItems);
  // Test search functionality on left list
  testSearchFunctionality('left', initialSelectedItems[0]);
  // Test moving all items from left to right
  moveAllItems('leftToRight', initialSelectedItems);
  // Test search functionality on right list
  testSearchFunctionality('right', initialSelectedItems[0]);
}

/**
 * Cypress command to test a dual-list component
 *
 * This command tests all aspects of a dual-list component including:
 * - Initial state validation
 * - Selecting and moving individual items between lists
 * - Moving all items between lists
 * - Search functionality in both lists
 *
 * The command automatically detects whether to test a left-to-right flow or right-to-left flow
 * based on which list has items initially.
 *
 * @example
 * // Test a dual-list with items initially in the available items
 * cy.expect_dual_list({
 *   availableItemsHeaderText: 'Available Items',
 *   selectedItemsHeaderText: 'Selected Items',
 *   availableItems: ['Item 1', 'Item 2', 'Item 3']
 * });
 *
 * @example
 * // Test a dual-list with items initially in the selected items
 * cy.expect_dual_list({
 *   availableItemsHeaderText: 'Unassigned Roles',
 *   selectedItemsHeaderText: 'Assigned Roles',
 *   selectedItems: ['Role 1', 'Role 2', 'Role 3']
 * });
 */
Cypress.Commands.add(
  'expect_dual_list',
  ({
    availableItemsHeaderText,
    selectedItemsHeaderText,
    availableItems = [],
    selectedItems = [],
  }) => {
    if (availableItems.length < 1 && selectedItems.length < 1) {
      cy.logAndThrowError(
        'cy.expect_dual_list: availableItems or selectedItems should have at least 1 item'
      );
    }

    // Verify headings
    if (availableItemsHeaderText) {
      cy.contains('h6', availableItemsHeaderText).should('be.visible');
    }
    if (selectedItemsHeaderText) {
      cy.contains('h6', selectedItemsHeaderText).should('be.visible');
    }

    // Determine which flow to test based on which list has items initially
    if (availableItems.length) {
      // Verify initial items in the left list
      assertListItems('first', availableItems);
      // Left-to-right flow (when left list has items)
      testDualListStartingFromAvailableItems(availableItems);
    } else if (selectedItems.length) {
      // Verify initial items in the right list
      assertListItems('last', selectedItems);
      // Right-to-left flow (when right list has items)
      testDualListStartingFromSelectedItems(selectedItems);
    }
  }
);
