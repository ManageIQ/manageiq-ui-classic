/**
 * Simulate dropping a field type from the Service Dialog palette into the first
 * section body using synthetic DragEvents.
 *
 * The drop handler in dynamic-section.jsx reads `e.dataTransfer.getData('text/plain')`
 * to determine the field type, so we build a DataTransfer carrying that value and
 * dispatch dragover + drop directly on the section body element.
 *
 * @param {string} fieldTypeId - The dialog field type class name, e.g. 'DialogFieldTextBox'
 * @example
 * cy.dropFieldIntoSection('DialogFieldDropDownList');
 */
Cypress.Commands.add('dropFieldIntoSection', (fieldTypeId) => {
  cy.get('.dynamic-section__body').first().then(($body) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', fieldTypeId);
    $body[0].dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    $body[0].dispatchEvent(new DragEvent('drop',     { bubbles: true, cancelable: true, dataTransfer: dt }));
  });
});

/**
 * Click the Edit button on the first dynamic field in the section to open
 * its Edit Field modal.
 *
 * The action button is always present in the DOM but hidden via CSS, so
 * { force: true } is required.
 *
 * @example
 * cy.openFieldEditModal();
 * cy.get('.cds--modal-container').should('be.visible');
 */
Cypress.Commands.add('openFieldEditModal', () => {
  cy.get('.dynamic-field-actions button:first-child').first().click({ force: true });
});
