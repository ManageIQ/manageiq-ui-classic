describe('Toolbar functionality tests with database operations', () => {
  describe('Toolbar with multiple database records', () => {
    let provider1 = '';
    let provider2 = '';
    let provider3 = '';

    beforeEach(() => {
      // Create multiple providers using database factories
      cy.appFactories([
        ['create', 'small_environment', { name: 'provider1', description: 'provider 1 test'}],
      ]).then((results) => {
        provider1 = results[0];
      });
      cy.appFactories([
        ['create', 'small_environment', { name: 'provider2', description: 'provider 2 test'}],
      ]).then((results) => {
        provider2 = results[0];
      });
      cy.appFactories([
        ['create', 'small_environment', { name: 'provider3', description: 'provider 3 test'}],
      ]).then((results) => {
        provider3 = results[0];
      });
      cy.login();
      cy.menu('Compute', 'Infrastructure', 'Providers');
    });

    afterEach(() => {
      cy.appDbState('restore');
    });

    it('Should handle toolbar operations with multiple items selected', () => {
      // Wait for the GTL table to load
      cy.gtlGetTable().should('be.visible');

      // Select multiple rows by clicking their checkboxes
      cy.get('.miq-data-table table tbody tr').then((rows) => {
        // Select first three rows by clicking their checkboxes
        cy.wrap(rows).eq(0).find('.cds--checkbox-label').click();
        cy.wrap(rows).eq(1).find('.cds--checkbox-label').click();
        cy.wrap(rows).eq(2).find('.cds--checkbox-label').click();
      });

      // Visit the Edit Tags page with the 3 providers selected
      cy.toolbar('Policy', 'Edit Tags');

      // Verify that the table loads on the Edit Tags page with the 3 providers selected
      cy.gtlGetTable().should('be.visible');
      cy.get(':nth-child(5) > h3').should('contain', '3 Infrastructure Providers Being Tagged');
      cy.get('tbody > :nth-child(1) > :nth-child(5)').contains(provider1.name);
      cy.get('tbody > :nth-child(2) > :nth-child(5)').contains(provider2.name);
      cy.get('tbody > :nth-child(3) > :nth-child(5)').contains(provider3.name);
    });

    it('Should handle the toolbar operations on the summary page', () => {
      // Wait for the GTL table to load
      cy.gtlGetTable().should('be.visible');

      // Get provider names from the GTL table
      const emsNames = [];
      cy.gtlGetRows([1]).then((result) => {
        result.forEach((row) => {
          emsNames.push(row[0]);
        });

        // Click on the first provider row using gtlClickRow
        cy.gtlClickRow([{title: emsNames[0], number: 1}]);
      });

      // Verify we navigated to the provider details page
      cy.get('#main-content').should('be.visible');

      // Visit the Edit Tags page with only 1 provider selected
      cy.toolbar('Policy', 'Edit Tags');

      // Verify that the table loads on the Edit Tags page with the one provider selected
      cy.gtlGetTable().should('be.visible');
      cy.get(':nth-child(5) > h3').should('contain', '1 Infrastructure Provider Being Tagged');
      cy.get('tbody > :nth-child(1) > :nth-child(5)').contains(provider1.name);
    });

    it('Should handle the toolbar operations on the nested list page', () => {
      // Wait for the GTL table to load
      cy.gtlGetTable().should('be.visible');

      // Get provider names from the GTL table
      const emsNames = [];
      cy.gtlGetRows([1]).then((result) => {
        result.forEach((row) => {
          emsNames.push(row[0]);
        });

        // Click on the first provider row using gtlClickRow
        cy.gtlClickRow([{title: emsNames[0], number: 1}]);

        // Verify we navigated to the provider details page
        cy.get('#main-content').should('be.visible');

        // Click on the Vms card
        cy.get(':nth-child(4) > .card-pf > .card-pf-title').click();

        // Verify we navigated to the VM nested list page
        cy.get('.col-md-7').contains(`${emsNames[0]} (All Direct VMs)`);
      });

      const vmNames = [];
      // Get VM names from the GTL table
      cy.gtlGetRows([1]).then((result) => {
        result.forEach((row) => {
          vmNames.push(row[0]);
        });

        // Select multiple rows by clicking their checkboxes
        cy.get('.miq-data-table table tbody tr').then((rows) => {
        // Select first two rows by clicking their checkboxes
          cy.wrap(rows).eq(0).find('.cds--checkbox-label').click();
          cy.wrap(rows).eq(1).find('.cds--checkbox-label').click();
        });

        // Visit the Edit Tags page with the 2 vms selected
        cy.toolbar('Policy', 'Edit Tags');

        // Verify that the table loads on the Edit Tags page with the two vms selected
        cy.get(':nth-child(5) > h3').should('contain', '2 VMs or Templates Being Tagged');

        cy.get('tbody > :nth-child(1) > :nth-child(1)').contains(vmNames[0]);
        cy.get('tbody > :nth-child(2) > :nth-child(1)').contains(vmNames[1]);
      });
    });
  });
});
