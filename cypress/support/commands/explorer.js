/* eslint-disable no-undef */

// title: String of the accordion title for the accordian panel to open.
Cypress.Commands.add('accordion', (title) => {
  cy.get('#main-content'); // ensure screen loads first
  let ret = cy.get('#accordion')
    .find('.panel-title a')
    .contains(new RegExp(`^${title}$`));

  ret.then((el) => {
    // Do not collapse if already expanded
    if (el.is('.collapsed')) {
      el.trigger('click');
    }
    return el;
  });

  return ret.parents('.panel');
});

// name: String of the record in the accordion panel to click.
Cypress.Commands.add('accordionItem', (name) => {
  cy.get('#main-content'); // ensure screen loads first

  cy.get('.list-group-item').contains(name).click();
});

/**
 * Selects an accordion item based on a path of labels.
 * @param accordionPath: The path can be a mix of strings and regular expressions.
 * For example, `[/^ManageIQ Region/, 'Zone', 'Server']`
 * will expand the accordion until it finds the item with the label 'Server' under 'Zone' under 'ManageIQ Region'.
 * If the path is not found, it will throw an error.
 */
Cypress.Commands.add('selectAccordionItem', (accordionPath) => {
  cy.get('div.panel-collapse.collapse.in').then((expandedAccordion) => {
    // Converting the list-items jQuery collection to an array for easier manipulation
    const listItems = [...expandedAccordion.find('li.list-group-item')];

    /**
     * Function to recursively expand the accordion and click the target item.
     * @param {number} accordionPathIndex: The current index in the accordionPath array.
     * @param {number} searchStartIndex: The index in the listItems array to start searching from,
     *                                   once the first label is matched, it is not required to start iterating from the beginning.
     * @returns {void}
     */
    const expandAndClickPath = (accordionPathIndex, searchStartIndex) => {
      const accordionLabel = accordionPath[accordionPathIndex];
      const isClickableNode = accordionPathIndex === accordionPath.length - 1;

      for (let i = searchStartIndex; i < listItems.length; i++) {
        /* @RemoveLater: Remove logger once the command is confirmed to be stable */
        Cypress.log({
          name: 'selectAccordionItem',
          message: `Loop index: ${i} & Searching for label: ${accordionLabel}`,
        });

        const liText = listItems[i].textContent.trim();
        // Check if the current item matches the label
        // Use either string match or regex match based on the type of accordionLabel
        let isMatch = false;
        if (typeof accordionLabel === 'string') {
          isMatch = liText === accordionLabel;
        } else if (accordionLabel instanceof RegExp) {
          isMatch = accordionLabel.test(liText);
        }

        if (isMatch) {
          /* @RemoveLater: Remove logger once the command is confirmed to be stable */
          Cypress.log({
            name: 'selectAccordionItem',
            message: `Matched "${liText}" at index ${i}`,
          });

          // Wrap the current li element in a jQuery object to use jQuery methods
          const currentLiElement = Cypress.$(listItems[i]);
          // If it's the last label in the path, then that is the desired item to click
          if (isClickableNode) {
            // Click the node corresponding to the last label in the given path and terminate
            cy.wrap(currentLiElement).click();
            return;
          }

          const isExpandable =
            currentLiElement.find('span.fa-angle-right').length > 0;

          // If it's not the last label in the path, either expand the node
          // or move to the next label in the given path
          if (isExpandable) {
            // Expand the node
            cy.wrap(currentLiElement)
              .find('span.fa-angle-right')
              .click()
              .then(() => {
                // Recurse to the next label in the given path array and
                // start iteration from the current index
                expandAndClickPath(accordionPathIndex + 1, i + 1);
              });
          } else {
            // If it's already expanded, continue to the next label
            // start iteration from the current index
            expandAndClickPath(accordionPathIndex + 1, i + 1);
          }
          // Exit the current function scope
          return;
        }
      }
      // Reaching this point indicates the label was not found - throw an error and exit.
      // Traversing up through the ancestors to get the name of the accordion where the lookup was performed
      const accordionPanel = expandedAccordion
        .closest('.panel')
        .find('.panel-heading h4.panel-title a')
        .text();
      const errorMessage = `${
        isClickableNode ? 'Target' : 'Intermediate'
      } node - "${accordionLabel}" was not found in the expanded "${accordionPanel}" accordion panel.`;
      cy.logAndThrowError(errorMessage);
    };

    // Start the recursive call from the first label in the given path
    // and from the beginning of the accordion items in the panel
    expandAndClickPath(0, 0);
  });
});
