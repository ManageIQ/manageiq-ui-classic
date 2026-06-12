describe('Automation > Embedded Automate > Import Datastore via Git', () => {
  beforeEach(() => {
    // Enable git_owner role in MiqRegion (required for git import functionality)
    cy.appFactories([
      ['create', 'miq_server'],
    ]).then((serverResults) => {
      cy.appEval(`
        MiqRegion.seed
        server = MiqServer.find(${serverResults[0].id})
        server_role = ServerRole.find_or_create_by(:name => 'git_owner')
        FactoryBot.create(:assigned_server_role,
                          :miq_server => server,
                          :server_role => server_role,
                          :active => true,
                          :priority => 1)
      `);
    });

    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Import / Export');
    cy.get('h3').contains('Import Datastore via Git').should('be.visible');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Git Import Button', () => {
    it('should display the import button', () => {
      cy.contains('button', 'Import from Git Repository').should('be.visible');
    });

    it('should open modal when button is clicked', () => {
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');
      cy.get('.cds--modal h2').contains('Import Datastore via Git').should('be.visible');
    });
  });

  describe('Git URL Form', () => {
    beforeEach(() => {
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');
    });

    it('should display the git URL form with all fields', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('label').contains('Git URL').should('be.visible');
        cy.get('label').contains('Username').should('be.visible');
        cy.get('label').contains('Password').should('be.visible');
        cy.get('label').contains('Verify Peer Certificate').should('be.visible');
        cy.get('button[type="submit"]').contains('Submit').should('be.disabled');
      });
    });

    it('should enable submit button when valid URL is entered', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.get('button[type="submit"]').contains('Submit').should('not.be.disabled');
      });
    });

    it('should show error message for invalid git URL submission', () => {
      // Intercept the API call and return an error
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 200,
        body: {
          message: 'Invalid git repository URL',
        },
      }).as('submitGitUrl');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://invalid-url.com');
        cy.get('button[type="submit"]').contains('Submit').click();
      });

      cy.wait('@submitGitUrl');
      cy.get('.cds--modal .cds--inline-notification.cds--inline-notification--error', { timeout: 5000 }).should('exist');
      cy.get('.cds--modal .cds--inline-notification__subtitle').should('contain', 'Invalid git repository URL');
    });
  });

  describe('Task Polling and Branch/Tag Selection', () => {
    beforeEach(() => {
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');
    });

    it('should poll for task completion and show branch/tag selector', () => {
      // Intercept the initial git URL submission
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 200,
        body: {
          task_id: 'task-123',
          git_repo_id: 'repo-456',
          new_git_repo: true,
        },
      }).as('submitGitUrl');

      // Intercept the polling request - first return "Active", then "Finished"
      let pollCount = 0;
      cy.intercept('GET', '/miq_ae_tools/check_git_task*', (req) => {
        pollCount++;
        if (pollCount === 1) {
          req.reply({
            statusCode: 200,
            body: { state: 'Active' },
          });
        } else {
          req.reply({
            statusCode: 200,
            body: {
              state: 'Finished',
              success: true,
              git_repo_id: 'repo-456',
              git_branches: ['main', 'develop', 'feature/test'],
              git_tags: ['v1.0.0', 'v2.0.0'],
            },
          });
        }
      }).as('checkTask');

      // Submit the form
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.get('button[type="submit"]').contains('Submit').click();
      });

      cy.wait('@submitGitUrl');
      cy.wait('@checkTask');

      // Wait for the branch/tag selector to appear
      cy.get('.cds--modal h2').contains('Choose the branch or tag you would like to import', { timeout: 10000 }).should('be.visible');
    });

    it('should show error when task fails', () => {
      // Intercept the initial git URL submission
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 200,
        body: {
          task_id: 'task-123',
          git_repo_id: 'repo-456',
          new_git_repo: true,
        },
      }).as('submitGitUrl');

      // Intercept the polling request with error - use nested message structure
      cy.intercept('GET', '/miq_ae_tools/check_git_task*', {
        statusCode: 200,
        body: {
          success: false,
          message: {
            message: 'Failed to fetch repository',
            level: 'error',
          },
        },
      }).as('checkTask');

      // Submit the form
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.get('button[type="submit"]').contains('Submit').click();
      });

      cy.wait('@submitGitUrl');
      cy.wait('@checkTask');

      // Check for error notification
      cy.get('.cds--modal .cds--inline-notification.cds--inline-notification--error', { timeout: 10000 }).should('exist');
      cy.get('.cds--modal .cds--inline-notification__subtitle').should('contain', 'Failed to fetch repository');
    });
  });

  describe('Branch/Tag Selection and Review', () => {
    beforeEach(() => {
      // Setup: Get to the branch/tag selection stage
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');

      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 200,
        body: {
          task_id: 'task-123',
          git_repo_id: 'repo-456',
          new_git_repo: true,
        },
      }).as('submitGitUrl');

      cy.intercept('GET', '/miq_ae_tools/check_git_task*', {
        statusCode: 200,
        body: {
          state: 'Finished',
          success: true,
          git_repo_id: 'repo-456',
          git_url: 'https://github.com/GilbertCherrie/CloudForms_Infoblox',
          git_branches: ['main', 'develop'],
          git_tags: ['v1.0.0', 'v2.0.0'],
        },
      }).as('checkTask');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.get('button[type="submit"]').contains('Submit').click();
      });
      cy.wait('@submitGitUrl');
      cy.wait('@checkTask');
      cy.get('.cds--modal h2').contains('Choose the branch or tag you would like to import', { timeout: 10000 }).should('be.visible');
    });

    it('should show branch/tag selector with ref_type dropdown', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="ref_type"]').should('be.visible');
        cy.get('button[type="submit"]').contains('Select').should('not.be.disabled');
      });
    });

    it('should switch between branches and tags', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        // Default should show branches
        cy.get('select[name="ref_type"]').should('have.value', 'branch');

        // Switch to tags
        cy.get('select[name="ref_type"]').select('tag');
        cy.get('select[name="ref_type"]').should('have.value', 'tag');
      });
    });

    it('should show review section after selecting branch', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').select('main');
        cy.get('button[type="submit"]').contains('Select').click();
      });

      // Modal should close and review section should appear
      cy.get('h3').contains('Review Git Import').should('be.visible');
      cy.get('dt').contains('Git Repository').should('be.visible');
      cy.get('dd').contains('https://github.com/GilbertCherrie/CloudForms_Infoblox').should('be.visible');
      cy.get('dt').contains('Branch').should('be.visible');
      cy.get('dd').contains('main').should('be.visible');
      cy.get('button').contains('Import').should('be.visible');
      cy.get('button').contains('Cancel').should('be.visible');
    });

    it('should import from review section successfully', () => {
      cy.intercept('POST', '/miq_ae_tools/import_via_git', {
        statusCode: 200,
        body: [{
          message: 'Import successful',
          level: 'success',
        }],
      }).as('importViaGit');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').select('main');
        cy.get('button[type="submit"]').contains('Select').click();
      });

      // Wait for review section to appear
      cy.get('h3').contains('Review Git Import').should('be.visible');

      // Click Import button in review section
      cy.contains('button', 'Import').click();

      cy.wait('@importViaGit').its('request.body').should('deep.include', {
        git_repo_id: 'repo-456',
        git_branch_or_tag: 'main',
        button: 'submit',
      });
      // Should show flash message and return to initial state
      cy.get('h3').contains('Import Datastore via Git', { timeout: 5000 }).should('be.visible');
    });

    it('should handle Back button in modal', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('button').contains('Back').click();
      });
      // Should go back to URL form
      cy.get('.cds--modal h2').contains('Import Datastore via Git').should('be.visible');
      cy.get('.cds--modal input[name="git_url"]').should('be.visible');
    });

    it('should handle cancel in review section', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').select('main');
        cy.get('button[type="submit"]').contains('Select').click();
      });

      // Wait for review section to appear
      cy.get('h3').contains('Review Git Import').should('be.visible');

      // Click Cancel button in review section
      cy.get('.review-git-import button').contains('Cancel').click();

      // Should return to initial state
      cy.get('h3').contains('Import Datastore via Git').should('be.visible');
      cy.contains('button', 'Import from Git Repository').should('be.visible');
    });

    it('should show error on import failure', () => {
      cy.intercept('POST', '/miq_ae_tools/import_via_git', {
        statusCode: 500,
        body: 'Import failed',
      }).as('importViaGit');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').select('main');
        cy.get('button[type="submit"]').contains('Select').click();
      });

      // Wait for review section to appear
      cy.get('h3').contains('Review Git Import').should('be.visible');

      // Click Import button
      cy.contains('button', 'Import').click();

      cy.wait('@importViaGit');
      cy.get('.cds--inline-notification.cds--inline-notification--error', { timeout: 5000 }).should('exist');
    });
  });

  describe('Error Notification', () => {
    beforeEach(() => {
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');
    });

    it('should allow closing error notification', () => {
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 500,
        body: 'Network error',
      }).as('submitGitUrl');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.get('button[type="submit"]').contains('Submit').click();
      });

      cy.wait('@submitGitUrl');

      // First close the error modal that appears on 500 errors (use force since it may be covered)
      cy.get('.modal.show').should('exist');
      cy.get('.modal.show .close').first().click({ force: true });
      cy.get('.modal.show').should('not.exist');

      // Now check and close the inline notification
      cy.get('.cds--modal.is-visible .cds--inline-notification.cds--inline-notification--error', { timeout: 5000 }).should('exist');
      cy.get('.cds--modal.is-visible .cds--inline-notification__close-button').click();
      cy.get('.cds--modal.is-visible .cds--inline-notification').should('not.exist');
    });
  });
});
