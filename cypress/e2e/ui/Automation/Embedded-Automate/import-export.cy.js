describe('Automate Import/Export Page', () => {
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
    cy.visit('/miq_ae_tools/import_export');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Page Layout', () => {
    it('should display all import/export sections', () => {
      cy.get('.import-export-page').should('exist');
      cy.contains('h3', 'Import Datastore classes (*.zip)').should('be.visible');
      cy.contains('h3', 'Import Datastore via Git').should('be.visible');
      cy.contains('h3', 'Export').scrollIntoView().should('be.visible');
      cy.contains('h3', /Reset all components/).scrollIntoView().should('be.visible');
    });
  });

  describe('File Upload Section', () => {
    it('should display file upload form', () => {
      cy.contains('Import Datastore classes (*.zip)').should('be.visible');
      cy.get('input[name="upload[file]"]').should('exist');
    });

    it('should have upload button disabled initially', () => {
      cy.contains('button', 'Upload').should('be.disabled');
    });

    it('should enable upload button when file is selected', () => {
      const fileName = 'test-datastore.zip';
      cy.get('input[name="upload[file]"]').selectFile({
        contents: Cypress.Buffer.from('test content'),
        fileName,
        mimeType: 'application/zip',
      }, { force: true });

      cy.contains('button', 'Upload').should('not.be.disabled');
    });

    it('should accept only zip files', () => {
      cy.get('input[name="upload[file]"]').should('have.attr', 'accept', '.zip');
    });
  });

  describe('Git Import Section - Stage 1: URL Submission', () => {
    beforeEach(() => {
      // Open the modal before each test
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');
    });

    it('should display git import form', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').should('exist');
        cy.get('input[name="git_username"]').should('exist');
        cy.get('input[name="git_password"]').should('exist');
        cy.get('input[name="git_verify_ssl"]').should('exist');
      });
    });

    it('should have submit button disabled initially', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.contains('button', 'Submit').should('be.disabled');
      });
    });

    it('should validate git URL format', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('invalid-url');
        cy.get('input[name="git_url"]').blur();
        cy.contains('Please provide a valid git URL').should('be.visible');
      });
    });

    it('should enable submit button with valid URL', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.contains('button', 'Submit').should('not.be.disabled');
      });
    });

    it('should submit git URL and start task polling', () => {
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
          state: 'Active',
        },
      }).as('pollTask');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.get('input[name="git_username"]').type('testuser');
        cy.get('input[name="git_password"]').type('testpass');
        cy.contains('button', 'Submit').click();
      });

      cy.wait('@submitGitUrl');
      cy.wait('@pollTask');
    });

    it('should show error notification on submission failure', () => {
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 500,
        body: { error: 'Network error' },
      }).as('submitGitUrlError');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.contains('button', 'Submit').click();
      });

      cy.wait('@submitGitUrlError');

      // First close the error modal that appears on 500 errors (use force since it may be covered)
      cy.get('.modal.show').should('exist');
      cy.get('.modal.show .close').first().click({ force: true });
      cy.get('.modal.show').should('not.exist');

      cy.get('.cds--modal.is-visible .cds--inline-notification--error', { timeout: 5000 }).should('exist');
    });
  });

  describe('Git Import Section - Stage 2: Branch/Tag Selection and Review', () => {
    beforeEach(() => {
      // Open the modal
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
          git_branches: ['main', 'develop', 'feature/test'],
          git_tags: ['v1.0.0', 'v1.1.0', 'v2.0.0'],
        },
      }).as('pollTaskComplete');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.contains('button', 'Submit').click();
      });
      cy.wait('@submitGitUrl');
      cy.wait('@pollTaskComplete');
    });

    it('should display branch/tag selection form after task completion', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.contains('Choose the branch or tag you would like to import').should('be.visible');
        cy.get('select[name="ref_type"]').should('exist');
      });
    });

    it('should show branches by default', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').should('exist');
        cy.get('select[name="branch_name"] option').should('contain', 'main');
        cy.get('select[name="branch_name"] option').should('contain', 'develop');
      });
    });

    it('should switch to tags when tag option is selected', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="ref_type"]').select('tag');
        cy.get('select[name="tag_name"] option').should('contain', 'v1.0.0');
        cy.get('select[name="tag_name"] option').should('contain', 'v2.0.0');
      });
    });

    it('should show review section after selecting branch', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').select('main');
        cy.contains('button', 'Select').click();
      });

      // Modal should close and review section should appear
      cy.contains('Review Git Import').should('be.visible');
      cy.get('dt').contains('Git Repository').should('be.visible');
      cy.get('dd').contains('https://github.com/GilbertCherrie/CloudForms_Infoblox').should('be.visible');
      cy.get('dt').contains('Branch').should('be.visible');
      cy.get('dd').contains('main').should('be.visible');
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
        cy.contains('button', 'Select').click();
      });

      // Wait for review section
      cy.contains('Review Git Import').should('be.visible');

      // Click Import button in review section
      cy.contains('button', 'Import').click();

      cy.wait('@importViaGit').its('request.body').should('deep.include', {
        git_repo_id: 'repo-456',
        git_branch_or_tag: 'main',
        button: 'submit',
      });
    });

    it('should import tag selection successfully', () => {
      cy.intercept('POST', '/miq_ae_tools/import_via_git', {
        statusCode: 200,
        body: [{
          message: 'Import successful',
          level: 'success',
        }],
      }).as('importViaGit');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="ref_type"]').select('tag');
        cy.get('select[name="tag_name"]').select('v2.0.0');
        cy.contains('button', 'Select').click();
      });

      // Wait for review section
      cy.contains('Review Git Import').should('be.visible');

      // Click Import button in review section
      cy.contains('button', 'Import').click();

      cy.wait('@importViaGit').its('request.body').should('deep.include', {
        git_repo_id: 'repo-456',
        git_branch_or_tag: 'v2.0.0',
        button: 'submit',
      });
    });

    it('should return to URL form when Back is clicked in modal', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.contains('button', 'Back').click();
      });
      cy.get('.cds--modal h2').contains('Import Datastore via Git').should('be.visible');
      cy.get('.cds--modal input[name="git_url"]').should('be.visible');
    });

    it('should return to URL form when cancel is clicked in review section', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').select('main');
        cy.contains('button', 'Select').click();
      });

      // Wait for review section
      cy.contains('Review Git Import').should('be.visible');

      // Click Cancel in review section
      cy.get('.review-git-import button').contains('Cancel').click();

      // Should return to initial state
      cy.contains('Import Datastore via Git').should('be.visible');
      cy.contains('button', 'Import from Git Repository').should('be.visible');
    });

    it('should show error notification on import failure', () => {
      cy.intercept('POST', '/miq_ae_tools/import_via_git', {
        statusCode: 500,
        body: 'Import failed',
      }).as('importViaGitError');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('select[name="branch_name"]').select('main');
        cy.contains('button', 'Select').click();
      });

      // Wait for review section
      cy.contains('Review Git Import').should('be.visible');

      // Click Import button
      cy.contains('button', 'Import').click();

      cy.wait('@importViaGitError');
      cy.get('.cds--inline-notification--error', { timeout: 5000 }).should('exist');
    });
  });

  describe('Export Section', () => {
    it('should display export button', () => {
      cy.contains('h3', 'Export').scrollIntoView().should('be.visible');
      cy.get('.export-section .cds--btn--icon-only').should('be.visible');
    });

    it('should have export icon', () => {
      cy.contains('h3', 'Export').scrollIntoView();
      cy.get('.export-section .cds--btn--icon-only')
        .find('svg')
        .should('exist');
    });

    it('should trigger export when clicked', () => {
      cy.intercept('GET', '/miq_ae_tools/export_datastore*').as('exportDatastore');

      cy.contains('h3', 'Export').scrollIntoView();
      cy.get('.export-section .cds--btn--icon-only').click();

      cy.wait('@exportDatastore');
    });
  });

  describe('Reset Datastore Section', () => {
    it('should display reset section with domain names', () => {
      cy.contains(/Reset all components in the following domains/).should('be.visible');
      cy.get('.reset-datastore-section .cds--btn--icon-only').first().should('be.visible');
    });

    it('should have reset icon', () => {
      cy.get('.reset-datastore-section .cds--btn--icon-only').first()
        .find('svg')
        .should('exist');
    });

    it('should show confirmation modal when reset is clicked', () => {
      cy.get('.reset-datastore-section .cds--btn--icon-only').first().click();
      cy.contains('Confirm Reset').should('be.visible');
      cy.contains('All Datastore customizations will be lost').should('be.visible');
    });

    it('should close modal when cancel is clicked', () => {
      cy.get('.reset-datastore-section .cds--btn--icon-only').first().click();
      cy.contains('Confirm Reset').should('be.visible');
      cy.get('.cds--modal.is-visible').within(() => {
        cy.contains('button', 'Cancel').click();
      });
      cy.contains('Confirm Reset').should('not.be.visible');
    });

    it('should submit reset when confirmed', () => {
      cy.intercept('POST', '/miq_ae_tools/reset_datastore', {
        statusCode: 200,
        body: { success: true },
      }).as('resetDatastore');

      cy.get('.reset-datastore-section .cds--btn--icon-only').first().click();
      cy.contains('Confirm Reset').should('be.visible');
      cy.get('.cds--modal.is-visible').within(() => {
        cy.contains('button', 'Reset').click();
      });

      cy.wait('@resetDatastore').its('request.body').should('deep.include', {
        button: 'reset',
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');
    });

    it('should have proper labels for form inputs', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('label').contains('Git URL').should('be.visible');
        cy.get('label').contains('Username').should('be.visible');
        cy.get('label').contains('Password').should('be.visible');
      });
    });

    it('should have focusable form inputs', () => {
      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').focus().should('have.focus');
        cy.get('input[name="git_username"]').focus().should('have.focus');
        cy.get('input[name="git_password"]').focus().should('have.focus');
      });
    });

    it('should have proper button roles', () => {
      cy.contains('button', 'Upload').should('have.attr', 'type', 'button');
      cy.get('.cds--modal.is-visible').within(() => {
        cy.contains('button', 'Submit').should('have.attr', 'type', 'submit');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display properly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.contains('h3', 'Import Datastore classes (*.zip)').should('be.visible');
      cy.contains('h3', 'Import Datastore via Git').should('be.visible');
      cy.contains('h3', 'Export').scrollIntoView().should('be.visible');
      cy.contains('h3', /Reset all components/).scrollIntoView().should('be.visible');
    });

    it('should display properly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.contains('h3', 'Import Datastore classes (*.zip)').should('be.visible');
      cy.contains('h3', 'Import Datastore via Git').should('be.visible');
      cy.contains('h3', 'Export').scrollIntoView().should('be.visible');
      cy.contains('h3', /Reset all components/).scrollIntoView().should('be.visible');
    });

    it('should display properly on desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.contains('h3', 'Import Datastore classes (*.zip)').should('be.visible');
      cy.contains('h3', 'Import Datastore via Git').should('be.visible');
      cy.contains('h3', 'Export').scrollIntoView().should('be.visible');
      cy.contains('h3', /Reset all components/).scrollIntoView().should('be.visible');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Open the modal before each test
      cy.contains('button', 'Import from Git Repository').click();
      cy.get('.cds--modal.is-visible').should('be.visible');
    });

    it('should handle task polling timeout gracefully', () => {
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 200,
        body: {
          task_id: 'task-timeout',
          git_repo_id: 'repo-456',
          new_git_repo: true,
        },
      }).as('submitGitUrl');

      cy.intercept('GET', '/miq_ae_tools/check_git_task*', {
        statusCode: 200,
        body: { state: 'Active' },
        delay: 5000,
      }).as('pollTaskSlow');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.contains('button', 'Submit').click();
      });
      cy.wait('@submitGitUrl');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        forceNetworkError: true,
      }).as('networkError');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.contains('button', 'Submit').click();
      });

      cy.get('.cds--modal .cds--inline-notification--error', { timeout: 10000 }).should('exist');
    });

    it('should show error notification on failure', () => {
      cy.intercept('POST', '/miq_ae_tools/retrieve_git_datastore', {
        statusCode: 500,
        body: { error: 'Test error' },
      }).as('submitError');

      cy.get('.cds--modal.is-visible').within(() => {
        cy.get('input[name="git_url"]').type('https://github.com/GilbertCherrie/CloudForms_Infoblox');
        cy.contains('button', 'Submit').click();
      });

      cy.wait('@submitError');

      // First close the error modal that appears on 500 errors (use force since it may be covered)
      cy.get('.modal.show').should('exist');
      cy.get('.modal.show .close').first().click({ force: true });
      cy.get('.modal.show').should('not.exist');

      cy.get('.cds--modal.is-visible .cds--inline-notification--error', { timeout: 10000 }).should('exist');
    });
  });
});

