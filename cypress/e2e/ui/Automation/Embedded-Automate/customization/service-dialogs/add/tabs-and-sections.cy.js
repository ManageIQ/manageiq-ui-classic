/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Customization > Service Dialogs', () => {
  beforeEach(() => {
    cy.navigateToAddDialog();
  });

  // General checks on the Service Dialog editor page
  describe('Dialog - editor page', () => {
    it('Should display the editor page properly', () => {
      cy.url().should('include', 'miq_ae_customization/editor');
    });

    it('Ensure there are fields to enter dialog name and description and verify their type', () => {
      cy.get('#dialogName')
        .should('be.visible')
        .should('have.prop', 'tagName').should('eq', 'INPUT');

      cy.get('#dialogDescription')
        .should('be.visible')
        .should('have.prop', 'tagName').should('eq', 'TEXTAREA');
    });

    it('Ensure there is a component list with allowed types', () => {
      const allowedValues = ['Text Box', 'Text Area', 'Check Box', 'Dropdown',
        'Radio Button', 'Datepicker', 'Timepicker', 'Tag Control'];

      cy.get('.component-item').each(($el) => {
        cy.wrap($el)
          .invoke('text')
          .then((text) => {
            expect(allowedValues).to.include(text.trim());
          });
      });
    });

    // Tabs
    describe('Tabs', () => {
      it('performs tab lifecycle actions', () => {
        cy.get('#dynamic-tabs ul[role="tablist"]')
          .within(() => {
            cy.get('li').should('have.length', 2);
            cy.get('li').first().find('button').invoke('text').should('eq', 'New Tab');
            cy.get('li').last().find('button').invoke('text').should('eq', 'Create Tab');
          });

        // Add tab
        cy.addTab();
        cy.get('#dynamic-tabs ul li').should('have.length', 3);
        cy.get('#dynamic-tabs ul li').eq(1).find('button').should('have.text', 'New Tab 1');

        // Delete a tab
        cy.deleteTab(1);
        cy.get('#dynamic-tabs ul li').should('have.length', 2);

        // Edit tab
        cy.clickTab(0);
        cy.openTabMenu(0);
        cy.openEditTabModal();
        cy.get('.edit-tab-modal').should('exist');
        cy.get('.bx--modal-header__heading').should('contain', 'Edit this New Tab');
        cy.get('button[type="submit"]').should('be.disabled');
        cy.editTabAndSubmit('T1', 'T1 desc');
        cy.get('#dynamic-tabs ul li').eq(0).find('button').should('have.text', 'T1');
        cy.get('.dynamic-tab-name h2').should('have.text', 'T1');

        // Cancel edit
        cy.openTabMenu(0);
        cy.openEditTabModal();
        cy.editTabAndCancel('T1 edited');
        cy.get('#dynamic-tabs ul li').eq(0).find('button').should('have.text', 'T1');

        // TODO::Reorder tab - drag downwards
        // TODO::Reorder tab - drag upwards
      });
    });

    // Sections
    describe('Sections', () => {
      it('performs section lifecycle actions', () => {
        cy.get('.dynamic-tabs-wrapper')
          .find('div[role="tabpanel"]').should('exist')
          .find('.dynamic-sections-wrapper #dynamic-tab-0-section-0')
          .find('.dynamic-section-title').should('have.text', 'New Section');

        // Checks text on the action buttons
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-actions')
          .within(() => {
            cy.get('button').should('have.length', 3)
              .each(($el) => {
                cy.wrap($el)
                  .invoke('attr', 'title')
                  .then((text) => {
                    expect(['Minimize', 'Edit section', 'Remove section']).to.include(text.trim());
                  });
              });
          });

        // Checks for the message inside empty section
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-contents')
          .invoke('text')
          .should('eq', 'Drag items here to add to the dialog. At least one item is required before saving');

        // Collapse a section
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-actions')
          .find('button[title="Minimize"]').click();
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-contents').should('not.exist');
        // Expand again
        cy.get('button[title="Maximize"]').click();
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-contents').should('exist');

        // Delete a section
        cy.deleteSection(0, 0);
        cy.get('#dynamic-tab-0-section-0').should('not.exist');;

        // Add a section
        cy.addSection();
        cy.get('.dynamic-tabs-wrapper')
          .find('.dynamic-sections-wrapper #dynamic-tab-0-section-0')
          .find('.dynamic-section-title').should('have.text', 'New Section');

        // Edit section
        cy.openEditSectionModal(0, 0);
        cy.get('.bx--modal-header__heading').should('contain', 'Edit this New Section');
        cy.get('input[name="section_name"]').should('exist');
        cy.get('textarea[name="section_description"]').should('exist');
        cy.get('button[type="submit"]').should('be.disabled');
        cy.editSectionAndSubmit('S1', 'S1 desc');
        cy.get('#dynamic-tab-0-section-0')
          .find('.dynamic-section-title').should('have.text', 'S1');

        // Cancel edit
        cy.openEditSectionModal(0, 0);
        cy.editSectionAndCancel('S1 edited');
        cy.get('#dynamic-tab-0-section-0')
          .find('.dynamic-section-title')
          .should('not.have.text', 'S1 edited')
          .should('have.text', 'S1');

        // TODO:: Reorder section - drag downwards
        // TODO:: Reorder section - drag upwards
      });
    });
  });
});

