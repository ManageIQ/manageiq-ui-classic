/* eslint-disable no-undef */

// toolbarButton: String for the text of the toolbar button to click.
// dropdownButton: String for the text of the dropdown button to click after the toolbar dropdown is opened.
Cypress.Commands.add('toolbar', (toolbarButton, dropdownButton = '') => {
  cy.get('#toolbar').get('button').then((toolbarButtons) => {
    const nums = [...Array(toolbarButtons.length).keys()];
    nums.forEach((index) => {
      const button = toolbarButtons[index].children[0];
      if (button && button.innerText && button.innerText.includes(toolbarButton)) {
        button.click();
        return;
      }
    });
  });

  if (dropdownButton) {
    cy.get('.bx--overflow-menu-options').then((dropdownButtons) => {
      const buttons = dropdownButtons.children();
      const nums = [...Array(buttons.length).keys()];
      nums.forEach((index) => {
        const button = buttons[index];
        if (button && button.innerText && button.innerText.includes(dropdownButton)) {
          button.children[0].click();
          return;
        }
      });
    });
  }
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
