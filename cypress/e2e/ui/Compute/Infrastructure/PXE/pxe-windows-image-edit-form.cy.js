import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

describe('Compute > Infrastructure > PXE > PXE Servers > Windows Image Edit', () => {
  beforeEach(() => {
    // Create a PXE Server
    cy.appFactories([
      ['create', 'pxe_server', { name: 'cy-pxe-server-win' }],
    ]).then(([server]) => {
      const pxeServerId = server.id;

      // Create a Windows Image linked to the server
      cy.appFactories([
        ['create', 'windows_image', {
          name: 'cy-windows-image',
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

  describe('Navigating to Windows Image Edit form', () => {
    beforeEach(() => {
      cy.accordion('PXE Servers');
      cy.selectAccordionItem(['cy-pxe-server-win', 'cy-windows-image']);
      cy.toolbar('Configuration', 'Edit this Windows Image');
    });

    it('resets the form to initial values when Reset is clicked', () => {
      // Select a type using a default seeded image type
      cy.getFormSelectFieldById({ selectId: 'img_type' }).select('CentOS-6');
      cy.getFormSelectFieldById({ selectId: 'img_type' }).should('have.value', '1');

      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).click();

      // Type should revert to <Unknown>
      cy.getFormSelectFieldById({ selectId: 'img_type' }).should('have.value', '');
    });

    it('saves the form and shows a success flash message', () => {
      cy.intercept('POST', '/pxe/pxe_wimg_edit/*').as('saveWindowsImage');

      // Select a type using a default seeded image type
      cy.getFormSelectFieldById({ selectId: 'img_type' }).select('CentOS-6');
      cy.getFormSelectFieldById({ selectId: 'img_type' }).should('have.value', '1');

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();
      cy.wait('@saveWindowsImage').its('response.statusCode').should('eq', 200);

      // After save, miqRedirectBack navigates to /pxe/explorer — verify the flash
      cy.expect_flash(flashClassMap.success);

      // Navigate back to the image detail panel and verify the saved values
      cy.accordion('PXE Servers');
      cy.selectAccordionItem(['cy-pxe-server-win', 'cy-windows-image']);

      cy.contains('.label_header', 'Type')
        .siblings('.content_value')
        .find('.content')
        .should('contain.text', 'CentOS-6');
    });

    it('cancels the edit and shows a warning flash message', () => {
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();
      cy.expect_flash(flashClassMap.warning, 'cancelled');
    });
  });
});
