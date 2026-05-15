// toolbarButton: String for the text of the toolbar button to click.
// toolbarOption: String for the text of the dropdown button to click after the toolbar dropdown is opened.
// otherOptions: Object (optional) - Additional options for toolbar interaction.
//               - matchedButtonIndex: Number (default: -1) - Index among buttons with matching text (0-based).
//                                     Use -1 to automatically select the first enabled button.
//                                     Use 0, 1, 2... to select a specific matched button by index.
Cypress.Commands.add('toolbar', (toolbarButton, toolbarOption = '', otherOptions = {}) => {
  const { matchedButtonIndex = -1 } = otherOptions;

  const clickToolbarButton = cy
    .get('#toolbar')
    .find('button')
    .then((buttons) => {
      const matchedButtons = [...buttons].filter(
        (btn) => btn.innerText.trim() === toolbarButton
      );
      const matchedButtonCount = matchedButtons.length;

      if (matchedButtonCount === 0) {
        cy.logAndThrowError(`cy.toolbar: Toolbar button: "${toolbarButton}" was not found`);
      }

      let targetToolbarButton;
      // If matchedButtonIndex is -1 (default), intelligently select the button
      if (matchedButtonIndex === -1) {
        // If only one button matches, use it
        if (matchedButtonCount === 1) {
          targetToolbarButton = matchedButtons[0];
        } else {
          // Multiple buttons found - prefer the first enabled one
          targetToolbarButton = matchedButtons.find((btn) => !btn.disabled);

          if (!targetToolbarButton) {
            // All buttons are disabled, use the first one (will fail with proper error)
            targetToolbarButton = matchedButtons[0];
          }
        }
      } else {
        // Specific matched button index requested
        if (matchedButtonIndex >= matchedButtonCount) {
          cy.logAndThrowError(
            `cy.toolbar: Matched button index ${matchedButtonIndex} out of range. Found ${matchedButtonCount} button(s) with text "${toolbarButton}". Index must be between 0 and ${matchedButtonCount - 1}.`
          );
        }
        targetToolbarButton = matchedButtons[matchedButtonIndex];
      }
      return cy.wrap(targetToolbarButton).click();
    });

  // If toolbarOption is provided, wait for toolbar to open,
  // then look for the given toolbar option
  if (toolbarOption) {
    return clickToolbarButton.then(() => {
      return cy.get('.cds--overflow-menu-options li button').then((toolbarOptions) => {
        const targetToolbarOption = [...toolbarOptions].find(
          (option) => option.innerText.trim() === toolbarOption
        );

        if (!targetToolbarOption) {
          cy.logAndThrowError(
            `"${toolbarOption}" option was not found in the "${toolbarButton}" toolbar`
          );
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
  cy.get('.cds--overflow-menu-options').then((tempButtons) => {
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
