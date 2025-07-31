/* eslint-disable no-undef */

// toolbarButton: String for the text of the toolbar button to click.
// toolbarOption: String for the text of the dropdown button to click after the toolbar dropdown is opened.
Cypress.Commands.add('toolbar', (toolbarButton, toolbarOption = '') => {
  const clickToolbarButton = cy
    .get('#toolbar')
    .find('button')
    .then((buttons) => {
      const targetToolbarButton = [...buttons].find(
        (btn) => btn.innerText.trim() === toolbarButton
      );

      if (!targetToolbarButton) {
        // throw error if given toolbar button is not found
        const errorMessage = `Toolbar button: "${toolbarButton}" was not found`;
        Cypress.log({
          name: 'error',
          displayName: '❗ CypressError:',
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
      return cy.wrap(targetToolbarButton).click();
    });

  // If toolbarOption is provided, wait for toolbar to open,
  // then look for the given toolbar option
  if (toolbarOption) {
    return clickToolbarButton.then(() => {
      return cy.get('.bx--overflow-menu-options li').then((toolbarOptions) => {
        const targetToolbarOption = [...toolbarOptions].find(
          (option) => option.innerText.trim() === toolbarOption
        );

        if (!targetToolbarOption) {
          // throw error if given toolbar option is not found
          const errorMessage = `"${toolbarOption}" option was not found in the "${toolbarButton}" toolbar`;
          Cypress.log({
            name: 'error',
            displayName: '❗ CypressError:',
            message: errorMessage,
          });
          throw new Error(errorMessage);
        }
        // returning the cypress chainable to the top of the command scope
        return cy.wrap(targetToolbarOption).click();
      });
    });
  }

  // else, just return the toolbar button click chain
  return clickToolbarButton;
});

// toolbarButton: String for the text of the toolbar button to click.
Cypress.Commands.add('toolbarItems', (toolbarButton) => {
  cy.toolbar(toolbarButton);
  const dropdownButtons = [];
  cy.get('.bx--overflow-menu-options').then((tempButtons) => {
    let buttons = tempButtons.children();
    const nums = [...Array(buttons.length).keys()];
    nums.forEach((index) => {
      const tempButton = buttons[index].children[0];
      dropdownButtons.push({
        text: tempButton.innerText.trim(),
        disabled: tempButton.disabled,
        button: tempButton,
      });
    });
    return dropdownButtons;
  });
});
