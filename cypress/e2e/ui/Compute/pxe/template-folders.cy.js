/* eslint-disable no-undef */

describe('Compute > Infrastructure > PXE > Customization Templates', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Compute', 'Infrastructure', 'PXE');
  });

  describe('Customization Template Folders Table', () => {
    beforeEach(() => {
      cy.accordion('Customization Templates');
    });

    it('displays and allows clicking on system folder, Examples (read only)', () => {
      // Click on Examples folder
      cy.clickTableRowByText({ text: 'Examples (read only)' });

      // Verify navigation occurred (tree node should be selected)
      cy.get('#treeview-customization_templates_tree')
        .find('.node-selected')
        .contains('Examples (read only)');

      cy.expect_explorer_title('Examples (read only)');
      cy.get('#gtl_div').contains('ESXi 4.1');
    });

    it('can click on a customization template within the system folder list and navigate to its details page', () => {
      // Click on Examples folder
      cy.clickTableRowByText({ text: 'Examples (read only)' });

      // Verify navigation occurred (tree node should be selected)
      cy.get('#treeview-customization_templates_tree')
        .find('.node-selected')
        .contains('Examples (read only)');

      cy.expect_explorer_title('Examples (read only)');
      cy.get('#gtl_div').contains('ESXi 4.1').click();

      cy.get('.cds--accordion__item > .cds--accordion__heading').contains('Basic Information');
      cy.expect_explorer_title('Customization Template "ESXi 4.1"');
      cy.get('[tabindex="0"] > .label_header').contains('Name');
      cy.get('[tabindex="0"] > .content_value > .content').contains('ESXi 4.1');
      cy.get('[tabindex="1"] > .label_header').contains('Description');
      cy.get('[tabindex="1"] > .content_value > .content').contains('ESXi 4.1');
      cy.get('[tabindex="2"] > .label_header').contains('Image Type');
      cy.get('[tabindex="2"] > .content_value > .content').should('have.value', '');
      cy.get('[tabindex="3"] > .label_header').contains('Type');
      cy.get('[tabindex="3"] > .content_value > .content').contains('Kickstart');

      cy.get('.cds--accordion__item > .cds--accordion__heading').contains('Script');
      cy.get('.CodeMirror-line').contains('vmaccepteula');
      cy.get('.CodeMirror-line').contains('rootpw --iscrypted <%= ManageIQ::Password.md5crypt(evm[:root_password]) %>');
    });

    it('displays default user folders', () => {
      // Check if table has rows (system folder + any user folders)
      cy.get('#template_folders_div').find('.cds--data-table tbody tr').should('have.length', '5');

      // Check if table has default user folders
      cy.get('#template_folders_div').contains('Examples (read only)');
      cy.get('#template_folders_div').contains('CentOS-6');
      cy.get('#template_folders_div').contains('ESX');
      cy.get('#template_folders_div').contains('RHEL-6');
      cy.get('#template_folders_div').contains('Windows');
    });

    it('navigates to folder content when clicked', () => {
      // Click on CentOS-6 folder
      cy.clickTableRowByText({ text: 'CentOS-6' });

      // Verify navigation occurred (tree node should be selected)
      cy.get('#treeview-customization_templates_tree').find('.node-selected').contains('CentOS-6');

      // Verify that the main content area updates
      cy.expect_explorer_title('Customization Templates for System Image Types "CentOS-6"');
    });
  });
});
