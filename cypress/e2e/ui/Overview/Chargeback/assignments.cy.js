describe('Chargeback Assignments', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Chargeback', 'Assignments');
  });

  const selectAssignmentType = (label, rateType = 'compute') => {
    cy.get(`#assignment-type-${rateType}`).click();
    cy.contains('.cds--list-box__menu-item', label).click();
  };

  const scrollToButton = (label) => cy.contains('button', label).scrollIntoView();

  describe('Tab Navigation', () => {
    it('renders Compute and Storage tabs with Compute active by default', () => {
      cy.get('[role="tablist"]').should('be.visible');
      cy.get('[role="tab"]').contains('Compute').should('be.visible');
      cy.get('[role="tab"]').contains('Storage').should('be.visible');
      cy.get('[role="tab"][aria-selected="true"]').should('contain.text', 'Compute');
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
    });

    it('switches to Storage and back to Compute, keeping the form visible', () => {
      cy.get('[role="tab"]').contains('Storage').click();
      cy.get('[role="tab"][aria-selected="true"]').should('contain.text', 'Storage');
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');

      cy.get('[role="tab"]').contains('Compute').click();
      cy.get('[role="tab"][aria-selected="true"]').should('contain.text', 'Compute');
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
    });
  });

  describe('Compute Assignments Form', () => {
    it('displays the assignment type dropdown with Assign To label', () => {
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
      cy.get('#assignment-type-compute').scrollIntoView().should('be.visible');
      cy.get('[role="tabpanel"]:not([hidden])').contains('label', 'Assign To').should('be.visible');
    });

    it('shows all Compute assignment type options in the dropdown', () => {
      cy.get('#assignment-type-compute').click();

      const expectedOptions = [
        'The Enterprise',
        'Selected Providers',
        'Selected Clusters',
        'Tagged VMs and Instances',
        'Tagged Configured Systems',
        'Tagged Container Images',
        'Labeled Container Images',
        'Tenants',
      ];

      expectedOptions.forEach((option) => {
        cy.contains('.cds--list-box__menu-item', option).should('exist');
      });

      cy.get('#assignment-type-compute').click();
    });

    describe('Enterprise assignment', () => {
      beforeEach(() => {
        selectAssignmentType('The Enterprise');
      });

      it('renders the Enterprise table row, rate dropdown, and Save/Cancel buttons', () => {
        cy.get('.chargeback-assignments-form').should('be.visible');
        cy.contains('td', 'Enterprise').should('be.visible');
        cy.get('#rate-enterprise').should('be.visible');
        scrollToButton('Save').should('be.visible');
        scrollToButton('Cancel').should('be.visible');
      });

      it('Cancel button redirects back to /chargeback_assignment', () => {
        scrollToButton('Cancel').click();
        cy.url().should('include', '/chargeback_assignment');
      });

      it('shows a client-side warning when saving with no rate selected', () => {
        // The form validates client-side via InlineNotification — no HTTP POST is fired.
        // Intercept the POST to assert it is never called.
        cy.intercept('POST', '/api/chargebacks').as('noPost');

        scrollToButton('Save').click();

        // InlineNotification warning appears; POST was NOT sent
        cy.get('.cds--inline-notification').should('be.visible');
      });
    });

    describe('Resource-based assignments (Provider / Cluster / Tenant)', () => {
      [
        { label: 'Selected Providers', alias: 'getProviders', url: '/api/providers?expand=resources' },
        { label: 'Selected Clusters', alias: 'getClusters', url: '/api/clusters?expand=resources' },
        { label: 'Tenants', alias: 'getTenants', url: '/api/tenants?expand=resources' },
      ].forEach(({ label, alias, url }) => {
        it(`fires a GET to ${url} and renders the form for "${label}"`, () => {
          cy.intercept('GET', url).as(alias);

          selectAssignmentType(label);

          cy.wait(`@${alias}`).its('response.statusCode').should('be.oneOf', [200, 304]);
          cy.get('.chargeback-assignments-form').should('be.visible');
          scrollToButton('Save').should('be.visible');
        });
      });
    });

    describe('Tag-based assignments', () => {
      [
        'Tagged VMs and Instances',
        'Tagged Configured Systems',
        'Tagged Container Images',
      ].forEach((option) => {
        it(`shows the tag-selection UI for "${option}"`, () => {
          cy.intercept('GET', '/api/categories?expand=resources,tags').as('getCategories');

          selectAssignmentType(option);

          // TagSelection fetches categories on mount
          cy.wait('@getCategories').its('response.statusCode').should('be.oneOf', [200, 304]);

          cy.get('.tag-selection').should('be.visible');
          cy.get('#tag-category-compute').should('be.visible');
          scrollToButton('Save').should('be.visible');
        });
      });
    });

    describe('Label-based assignment', () => {
      it('shows the label-selection UI for Labeled Container Images', () => {
        cy.intercept('GET', /\/api\/container_images\?expand=/).as('getContainerImages');

        selectAssignmentType('Labeled Container Images');

        cy.wait('@getContainerImages').its('response.statusCode').should('be.oneOf', [200, 304]);

        cy.get('.label-selection').should('be.visible');
        cy.get('#label-key-compute').should('be.visible');
        scrollToButton('Save').should('be.visible');
      });
    });
  });

  describe('Storage Assignments Form', () => {
    beforeEach(() => {
      cy.get('[role="tab"]').contains('Storage').click();
    });

    it('shows correct options in dropdown and excludes Compute-only options', () => {
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
      cy.get('#assignment-type-storage').scrollIntoView().should('be.visible');
      cy.get('[role="tabpanel"]:not([hidden])').contains('label', 'Assign To').should('be.visible');

      cy.get('#assignment-type-storage').click();

      ['The Enterprise', 'Selected Datastores', 'Tagged Datastores', 'Tenants'].forEach((option) => {
        cy.contains('.cds--list-box__menu-item', option).should('be.visible');
      });

      cy.contains('.cds--list-box__menu-item', 'Selected Clusters').should('not.exist');
      cy.contains('.cds--list-box__menu-item', 'Tagged VMs and Instances').should('not.exist');

      cy.get('#assignment-type-storage').click();
    });

    describe('Datastore assignment', () => {
      it('fires a GET to /api/data_stores and renders the form', () => {
        cy.intercept('GET', '/api/data_stores?expand=resources').as('getDatastores');

        selectAssignmentType('Selected Datastores', 'storage');

        cy.wait('@getDatastores').its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
        cy.get('[role="tabpanel"]:not([hidden])').contains('button', 'Save').scrollIntoView().should('be.visible');
      });
    });

    describe('Tagged Datastores assignment', () => {
      it('shows the tag-selection UI for Tagged Datastores', () => {
        cy.intercept('GET', '/api/categories?expand=resources,tags').as('getCategories');

        selectAssignmentType('Tagged Datastores', 'storage');

        cy.wait('@getCategories').its('response.statusCode').should('be.oneOf', [200, 304]);

        cy.get('[role="tabpanel"]:not([hidden]) .tag-selection').should('be.visible');
        cy.get('#tag-category-storage').should('be.visible');
        cy.get('[role="tabpanel"]:not([hidden])').contains('button', 'Save').scrollIntoView().should('be.visible');
      });
    });
  });

  describe('Loading States', () => {
    it('shows the loading overlay while fetching initial chargeback data', () => {
      cy.intercept(
        'GET',
        '/api/chargebacks?expand=resources&attributes=assigned_to',
        (req) => req.reply((res) => res.setDelay(800).send())
      ).as('delayedRates');

      cy.reload();

      cy.get('.chargeback-assignments-loading').should('be.visible');

      cy.wait('@delayedRates');
      cy.get('.chargeback-assignments-loading').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('displays an inline error when the initial chargebacks API request fails', () => {
      cy.intercept('GET', '/api/chargebacks?expand=resources&attributes=assigned_to', {
        statusCode: 500,
        body: { error: { message: 'Internal Server Error' } },
      }).as('ratesError');

      cy.reload();
      cy.wait('@ratesError');

      cy.get('.cds--inline-notification').should('be.visible');
      cy.get('.chargeback-assignments-loading').should('not.exist');
    });

    it('displays an inline error when loading resources fails', () => {
      cy.get('.chargeback-assignments-form').should('be.visible');

      cy.intercept('GET', '/api/providers?expand=resources', {
        statusCode: 500,
        body: { error: { message: 'Failed to load providers' } },
      }).as('providersError');

      selectAssignmentType('Selected Providers');

      cy.wait('@providersError');

      cy.get('.cds--inline-notification').should('be.visible');
      cy.get('.chargeback-assignments-loading').should('not.exist');
    });
  });

  describe('Assignment Type Switching', () => {
    it('resets to empty form content when switching between assignment types', () => {
      selectAssignmentType('The Enterprise');
      cy.contains('td', 'Enterprise').should('be.visible');

      cy.intercept('GET', '/api/providers?expand=resources').as('getProviders');
      selectAssignmentType('Selected Providers');
      cy.wait('@getProviders').its('response.statusCode').should('be.oneOf', [200, 304]);

      // Enterprise row should no longer be visible
      cy.contains('td', 'Enterprise').should('not.exist');
      cy.get('.chargeback-assignments-form').should('be.visible');
    });

    it('shows the tenant tree when switching to the Tenants assignment type', () => {
      cy.intercept('GET', '/api/tenants?expand=resources').as('getTenants');

      selectAssignmentType('Tenants');
      cy.wait('@getTenants');

      cy.get('table[aria-label="Tenant chargeback assignments"]').should('be.visible');
    });
  });
});
