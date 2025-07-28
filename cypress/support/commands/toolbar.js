/* eslint-disable no-undef */

// toolbarButton: String for the text of the toolbar button to click.
// dropdownButton: String for the text of the dropdown button to click after the toolbar dropdown is opened.
Cypress.Commands.add('toolbar', (toolbarButton, dropdownButton = '') => {
  cy.get('#toolbar').get('button').then((toolbarButtons) => {
    const nums = [...Array(toolbarButtons.length).keys()];
    let toolbarButtonMatched = false;
    nums.forEach((index) => {
      const button = toolbarButtons[index].children[0];
      if (button && button.innerText && button.innerText.includes(toolbarButton)) {
        toolbarButtonMatched = true;
        button.click();
        return;
      }
    });
    if (!toolbarButtonMatched) {
      // throw error if given toolbar button is not found
      const errorMessage = `Toolbar button: "${toolbarButton}" was not found`;
      Cypress.log({
        name: 'error',
        displayName: '❗ CypressError:',
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }
  });

  if (dropdownButton) {
    return cy.get('.bx--overflow-menu-options').then((dropdownButtons) => {
      const buttons = dropdownButtons.children();
      for (let index = 0; index < buttons.length; index++) {
        const button = buttons[index];
        if (
          button &&
          button.innerText &&
          button.innerText.includes(dropdownButton)
        ) {
          return cy.wrap(button.children[0]).click();
        }
      }
      // throw error if given dropdown button is not found
      const errorMessage = `"${dropdownButton}" option was not found in the "${toolbarButton}" toolbar`;
      Cypress.log({
        name: 'error',
        displayName: '❗ CypressError:',
        message: errorMessage,
      });
      throw new Error(errorMessage);
    });
  }
  return cy.wrap(null);
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
