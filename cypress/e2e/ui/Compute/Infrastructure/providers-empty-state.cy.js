describe('Empty State Component', () => {
  const providers = [
    { path: '/ems_cloud/show_list', name: 'Cloud Providers', newPath: '/ems_cloud/new', newPageTitle: 'Add New Cloud Provider' },
    { path: '/ems_infra/show_list', name: 'Infrastructure Providers', newPath: '/ems_infra/new', newPageTitle: 'Add New Infrastructure Provider' },
    { path: '/ems_physical_infra/show_list', name: 'Physical Infrastructure Providers', newPath: '/ems_physical_infra/new', newPageTitle: 'Add New Physical Infrastructure Provider' },
    { path: '/ems_container/show_list', name: 'Container Providers', newPath: '/ems_container/new', newPageTitle: 'Add New Containers Provider' },
    { path: '/ems_network/show_list', name: 'Network Providers', newPath: '/ems_network/new', newPageTitle: 'Add New Network Provider' },
    { path: '/ems_storage/show_list', name: 'Storage Managers', newPath: '/ems_storage/new', newPageTitle: 'Add New Storage Manager' },
    { path: '/ems_configuration/show_list', name: 'Configuration Managers', newPath: '/ems_configuration/new', newPageTitle: 'Add New Configuration Manager' },
  ];

  beforeEach(() => {
    cy.login();
  });

  providers.forEach((provider) => {
    describe(`${provider.name}`, () => {
      it('should display empty state when no providers exist', () => {
        cy.intercept('POST', '/ems_infra/show_list').as('showList');
        cy.visit(provider.path);

        // Check if empty state is displayed
        cy.get('.empty-state-carbon').should('be.visible');
        cy.get('.empty-state-carbon__title').should('contain', 'Add a Provider');
        cy.get('.empty-state-carbon__description').should('contain', "You don't have any providers to display");
      });

      it('should display the add button and navigate to correct path when clicked', () => {
        cy.visit(provider.path);

        cy.get('.empty-state-carbon button').should('be.visible');
        cy.get('.empty-state-carbon button').should('contain', 'Add a Provider');

        // Click the button and verify navigation
        cy.get('.empty-state-carbon button').click();
        cy.url().should('include', provider.newPath);

        // Verify the new page title
        cy.get('h1').should('contain', provider.newPageTitle);
      });
    });
  });
});
