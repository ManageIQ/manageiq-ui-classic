import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

describe('Compute > Infrastructure > PXE > PXE Servers > PXE Image Edit', () => {
  beforeEach(() => {
    // Create a PXE Server
    cy.appFactories([
      ['create', 'pxe_server', { name: 'cy-pxe-server' }],
    ]).then(([server]) => {
      const pxeServerId = server.id;

      // Create a PXE Image linked to the server
      cy.appFactories([
        ['create', 'pxe_image', {
          name: 'cy-pxe-image',
          pxe_server_id: pxeServerId,
        }],
      ]);
    });
    cy.login();
    cy.menu('Compute', 'Infrastructure', 'PXE');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Navigating to PXE Image Edit form', () => {
    beforeEach(() => {
      cy.accordion('PXE Servers');
      cy.selectAccordionItem(['cy-pxe-server', 'cy-pxe-image']);
      cy.toolbar('Configuration', 'Edit this PXE Image');
    });

    it('resets the form to initial values when Reset is clicked', () => {
      // Change the Type dropdown using a default seeded image type
      cy.getFormSelectFieldById({ selectId: 'img_type' }).select('CentOS-6');
      cy.getFormSelectFieldById({ selectId: 'img_type' }).should('have.value', '1');

      // Check the Windows Boot Environment checkbox
      cy.get('label[for="default_for_windows"]').click();
      cy.get('input#default_for_windows').should('be.checked');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      // Both fields should revert to their initial values
      cy.getFormSelectFieldById({ selectId: 'img_type' }).should('have.value', '');
      cy.get('input#default_for_windows').should('not.be.checked');
    });

    it('saves the form and shows a success flash message', () => {
      cy.intercept('POST', '/pxe/pxe_image_edit/*').as('saveImage');

      // Select a type and check the Windows Boot Environment checkbox
      cy.getFormSelectFieldById({ selectId: 'img_type' }).select('CentOS-6');
      cy.getFormSelectFieldById({ selectId: 'img_type' }).should('have.value', '1');

      cy.get('label[for="default_for_windows"]').click();
      cy.get('input#default_for_windows').should('be.checked');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

      cy.wait('@saveImage').its('response.statusCode').should('eq', 200);

      // After save, miqRedirectBack navigates to /pxe/explorer — verify the flash
      cy.expect_flash(flashClassMap.success);

      // Navigate back to the image detail panel and verify the saved values
      cy.accordion('PXE Servers');
      cy.selectAccordionItem(['cy-pxe-server', 'cy-pxe-image']);

      cy.contains('.label_header', 'Type')
        .siblings('.content_value')
        .find('.content')
        .should('contain.text', 'CentOS-6');

      cy.contains('.label_header', 'Windows Boot Environment')
        .siblings('.content_value')
        .find('.content')
        .should('contain.text', 'Yes');
    });

    it('cancels the edit and shows a warning flash message', () => {
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });
  });
});
