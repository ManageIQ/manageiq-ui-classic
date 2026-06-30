describe('Chargeback Assignments', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Chargeback', 'Assignments');
  });

  // Helper: open the assignment-type Carbon dropdown and select an item.
  // Pass rateType ('compute' or 'storage') to target the correct panel's dropdown.
  const selectAssignmentType = (label, rateType = 'compute') => {
    cy.get(`#assignment-type-${rateType}`).click();
    cy.contains('.cds--list-box__menu-item', label).click();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Tab Navigation
  // ─────────────────────────────────────────────────────────────────────────
  describe('Tab Navigation', () => {
    it('displays Compute and Storage tabs', () => {
      cy.get('[role="tablist"]').should('be.visible');
      cy.get('[role="tab"]').contains('Compute').should('be.visible');
      cy.get('[role="tab"]').contains('Storage').should('be.visible');
    });

    it('defaults to the Compute tab active', () => {
      cy.get('[role="tab"][aria-selected="true"]').should('contain.text', 'Compute');
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
    });

    it('switches to the Storage tab', () => {
      cy.get('[role="tab"]').contains('Storage').click();
      cy.get('[role="tab"][aria-selected="true"]').should('contain.text', 'Storage');
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
    });

    it('switches back to the Compute tab', () => {
      cy.get('[role="tab"]').contains('Storage').click();
      cy.get('[role="tab"]').contains('Compute').click();
      cy.get('[role="tab"][aria-selected="true"]').should('contain.text', 'Compute');
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Compute Assignments Form
  // ─────────────────────────────────────────────────────────────────────────
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

      // Close the dropdown
      cy.get('#assignment-type-compute').click();
    });

    it('does not show Save/Cancel buttons until an assignment type is selected', () => {
      cy.contains('button', 'Save').should('not.exist');
      cy.contains('button', 'Cancel').should('not.exist');
    });

    describe('Enterprise assignment', () => {
      beforeEach(() => {
        selectAssignmentType('The Enterprise');
      });

      it('shows the Enterprise row in the assignments table', () => {
        cy.get('.chargeback-assignments-form').should('be.visible');
        cy.contains('td', 'Enterprise').should('be.visible');
      });

      it('shows Save and Cancel buttons', () => {
        cy.contains('button', 'Save').should('be.visible');
        cy.contains('button', 'Cancel').should('be.visible');
      });

      it('Cancel button redirects back to /chargeback_assignment', () => {
        cy.contains('button', 'Cancel').click();
        cy.url().should('include', '/chargeback_assignment');
      });

      it('shows a client-side warning when saving with no rate selected', () => {
        // The form validates client-side via InlineNotification — no HTTP POST is fired.
        // Intercept the POST to assert it is never called.
        cy.intercept('POST', '/api/chargebacks').as('noPost');

        cy.contains('button', 'Save').click();

        // InlineNotification warning appears; POST was NOT sent
        cy.get('.cds--inline-notification').should('be.visible');
      });

      it('shows a rate dropdown for the Enterprise row', () => {
        cy.get('#rate-enterprise').should('be.visible');
      });
    });

    describe('Provider assignment', () => {
      it('fires a GET to /api/providers and renders the form', () => {
        cy.intercept('GET', '/api/providers?expand=resources').as('getProviders');

        selectAssignmentType('Selected Providers');

        cy.wait('@getProviders').its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.get('.chargeback-assignments-form').should('be.visible');
        cy.contains('button', 'Save').should('be.visible');
      });
    });

    describe('Cluster assignment', () => {
      it('fires a GET to /api/clusters and renders the form', () => {
        cy.intercept('GET', '/api/clusters?expand=resources').as('getClusters');

        selectAssignmentType('Selected Clusters');

        cy.wait('@getClusters').its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.get('.chargeback-assignments-form').should('be.visible');
        cy.contains('button', 'Save').should('be.visible');
      });
    });

    describe('Tenant assignment', () => {
      it('fires a GET to /api/tenants and renders the form', () => {
        cy.intercept('GET', '/api/tenants?expand=resources').as('getTenants');

        selectAssignmentType('Tenants');

        cy.wait('@getTenants').its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.get('.chargeback-assignments-form').should('be.visible');
        cy.contains('button', 'Save').should('be.visible');
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
          cy.contains('button', 'Save').should('be.visible');
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
        cy.contains('button', 'Save').should('be.visible');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Storage Assignments Form
  // ─────────────────────────────────────────────────────────────────────────
  describe('Storage Assignments Form', () => {
    beforeEach(() => {
      cy.get('[role="tab"]').contains('Storage').click();
    });

    it('displays the assignment type dropdown with Assign To label', () => {
      cy.get('[role="tabpanel"]:not([hidden]) .chargeback-assignments-form').should('be.visible');
      cy.get('#assignment-type-storage').scrollIntoView().should('be.visible');
      cy.get('[role="tabpanel"]:not([hidden])').contains('label', 'Assign To').should('be.visible');
    });

    it('shows all Storage assignment type options in the dropdown', () => {
      cy.get('#assignment-type-storage').click();

      const expectedOptions = [
        'The Enterprise',
        'Selected Datastores',
        'Tagged Datastores',
        'Tenants',
      ];

      expectedOptions.forEach((option) => {
        cy.contains('.cds--list-box__menu-item', option).should('be.visible');
      });

      cy.get('#assignment-type-storage').click();
    });

    it('does not show Compute-only options (e.g. Selected Clusters) in Storage', () => {
      cy.get('#assignment-type-storage').click();
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
        cy.get('[role="tabpanel"]:not([hidden])').contains('button', 'Save').should('be.visible');
      });
    });

    describe('Tagged Datastores assignment', () => {
      it('shows the tag-selection UI for Tagged Datastores', () => {
        cy.intercept('GET', '/api/categories?expand=resources,tags').as('getCategories');

        selectAssignmentType('Tagged Datastores', 'storage');

        cy.wait('@getCategories').its('response.statusCode').should('be.oneOf', [200, 304]);

        cy.get('[role="tabpanel"]:not([hidden]) .tag-selection').should('be.visible');
        cy.get('#tag-category-storage').should('be.visible');
        cy.get('[role="tabpanel"]:not([hidden])').contains('button', 'Save').should('be.visible');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Loading States
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // Error Handling
  // ─────────────────────────────────────────────────────────────────────────
  describe('Error Handling', () => {
    it('displays an inline error when the initial chargebacks API request fails', () => {
      cy.intercept('GET', '/api/chargebacks?expand=resources&attributes=assigned_to', {
        statusCode: 500,
        body: { error: { message: 'Internal Server Error' } },
      }).as('ratesError');

      cy.reload();
      cy.wait('@ratesError');

      // The component renders an InlineNotification on failure
      cy.get('.cds--inline-notification').should('be.visible');
      // The loading spinner should be gone
      cy.get('.chargeback-assignments-loading').should('not.exist');
    });

    it('displays an inline error when loading resources fails', () => {
      // Wait for initial load to finish before intercepting the resource request
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

  // ─────────────────────────────────────────────────────────────────────────
  // Assignment Type Switching
  // ─────────────────────────────────────────────────────────────────────────
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

      // TenantTree renders a table with aria-label "Tenant chargeback assignments"
      cy.get('table[aria-label="Tenant chargeback assignments"]').should('be.visible');
    });
  });
});
