import { flashClassMap } from '../../../../../support/assertions/assertion_constants';

describe('Automation > Embedded Automate > Explorer > Git Domain Refresh', () => {
  let gitDomainName;

  beforeEach(() => {
    // Enable git_owner role in MiqRegion (required for git refresh button to be visible)
    // Create an active assigned_server_role for git_owner
    cy.appFactories([
      ['create', 'miq_server'],
    ]).then((serverResults) => {
      cy.appEval(`
        server = MiqServer.find(${serverResults[0].id})
        server_role = ServerRole.find_or_create_by(:name => 'git_owner')
        FactoryBot.create(:assigned_server_role,
                          :miq_server => server,
                          :server_role => server_role,
                          :active => true,
                          :priority => 1)
      `);
    });

    // Set up a git domain using FactoryBot via appFactories
    cy.appFactories([
      ['create', 'git_repository', {
        url: 'https://github.com/GilbertCherrie/CloudForms_Infoblox',
      }],
    ]).then((results) => {
      const gitRepoId = results[0].id;

      // Create git branches and tags matching the actual GitHub repository
      cy.appFactories([
        ['create', 'git_branch', {
          name: 'master',
          git_repository_id: gitRepoId,
        }],
        ['create', 'git_branch', {
          name: 'test-branch-0',
          git_repository_id: gitRepoId,
        }],
        ['create', 'git_branch', {
          name: 'test-branch-1',
          git_repository_id: gitRepoId,
        }],
        ['create', 'git_tag', {
          name: 'test1',
          git_repository_id: gitRepoId,
        }],
        ['create', 'git_tag', {
          name: 'test2',
          git_repository_id: gitRepoId,
        }],
        ['create', 'git_tag', {
          name: 'test3',
          git_repository_id: gitRepoId,
        }],
      ]).then(() => {
        // Create the git domain with a name matching the repository
        cy.appFactories([
          ['create', 'miq_ae_git_domain', {
            name: 'CloudForms_Infoblox',
            git_repository_id: gitRepoId,
            ref: 'origin/master',
            ref_type: 'branch',
          }],
        ]).then((gitResults) => {
          gitDomainName = gitResults[0].name;
        });
      });
    });

    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.expect_explorer_title('Datastore');
    cy.accordion('Datastore');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Git Domain Refresh Form', () => {
    beforeEach(() => {
      // Navigate to the specific git domain by name
      // Git domains display as: "CloudForms_Infoblox (master) (Locked)"
      // Match the domain name followed by branch/tag info and (Locked)
      cy.selectAccordionItem(['Datastore', new RegExp(`${gitDomainName}.*\\(Locked\\)`)]);
    });

    it('Clicks the cancel button', () => {
      cy.toolbar('Configuration', 'Refresh with a new branch or tag');

      // Click cancel button
      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click();

      // Verify we're back at the explorer (flash message confirms cancel)
      cy.expect_flash(flashClassMap.warning, 'canceled');
    });

    it('Displays the git domain refresh form with branch selection', () => {
      cy.toolbar('Configuration', 'Refresh with a new branch or tag');

      // Verify form elements are present
      cy.getFormSelectFieldById({ selectId: 'ref_type' }).should('be.visible');
      cy.getFormSelectFieldById({ selectId: 'branch_name' }).should('be.visible');
    });

    it('Switches between branch and tag selection', () => {
      cy.toolbar('Configuration', 'Refresh with a new branch or tag');

      // Select branch type
      cy.getFormSelectFieldById({ selectId: 'ref_type' }).select('branch');
      cy.getFormSelectFieldById({ selectId: 'branch_name' }).should('be.visible');
      cy.getFormSelectFieldById({ selectId: 'tag_name' }).should('not.exist');

      // Select tag type
      cy.getFormSelectFieldById({ selectId: 'ref_type' }).select('tag');
      cy.getFormSelectFieldById({ selectId: 'tag_name' }).should('be.visible');
      cy.getFormSelectFieldById({ selectId: 'branch_name' }).should('not.exist');
    });

    it('Refreshes git domain with a new branch', () => {
      cy.toolbar('Configuration', 'Refresh with a new branch or tag');

      // Intercept the API POST request
      cy.intercept('POST', '/api/automate_domains/*').as('refreshGitDomain');

      // Verify initial branch is selected
      cy.getFormSelectFieldById({ selectId: 'ref_type' }).should('have.value', 'branch');
      cy.getFormSelectFieldById({ selectId: 'branch_name' }).should('be.visible');

      // Get the selected branch name before changing
      cy.getFormSelectFieldById({ selectId: 'branch_name' }).invoke('val').then((initialBranch) => {
        // Select a different branch (third option)
        cy.getFormSelectFieldById({ selectId: 'branch_name' }).select(2);

        // Verify the branch selection changed
        cy.getFormSelectFieldById({ selectId: 'branch_name' }).invoke('val').should('not.equal', initialBranch);

        // Get the newly selected branch value
        cy.getFormSelectFieldById({ selectId: 'branch_name' }).invoke('val').then((selectedBranch) => {
          // Click Save button
          cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

          // Verify the request was made with correct body including the selected branch
          cy.wait('@refreshGitDomain').then((interception) => {
            const body = typeof interception.request.body === 'string'
              ? JSON.parse(interception.request.body)
              : interception.request.body;
            expect(body).to.have.property('action', 'refresh_from_source');
            expect(body).to.have.property('resource');
            expect(body.resource).to.have.property('ref_type', 'branch');
            expect(body.resource).to.have.property('ref', selectedBranch);
          });

          // Verify success flash message appears
          cy.expect_flash(flashClassMap.success, 'Refreshing Automate Domain');

          // Verify the explorer title shows the updated branch
          cy.get('#explorer_title_text').should('contain', selectedBranch);
          cy.get('#explorer_title_text').should('contain', gitDomainName);
        });
      });
    });

    it('Refreshes git domain with a tag', () => {
      cy.toolbar('Configuration', 'Refresh with a new branch or tag');

      // Intercept the API POST request
      cy.intercept('POST', '/api/automate_domains/*').as('refreshGitDomain');

      // Switch to tag type
      cy.getFormSelectFieldById({ selectId: 'ref_type' }).select('tag');

      // Verify tag select is now visible and branch select is hidden
      cy.getFormSelectFieldById({ selectId: 'tag_name' }).should('be.visible');
      cy.getFormSelectFieldById({ selectId: 'branch_name' }).should('not.exist');

      // Select a tag (second option)
      cy.getFormSelectFieldById({ selectId: 'tag_name' }).select(1);

      // Get the selected tag value
      cy.getFormSelectFieldById({ selectId: 'tag_name' }).invoke('val').then((selectedTag) => {
        // Verify a tag is selected
        expect(selectedTag).to.not.be.empty;

        // Click Save button
        cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click();

        // Verify the request was made with correct body including the selected tag
        cy.wait('@refreshGitDomain').then((interception) => {
          const body = typeof interception.request.body === 'string'
            ? JSON.parse(interception.request.body)
            : interception.request.body;
          expect(body).to.have.property('action', 'refresh_from_source');
          expect(body).to.have.property('resource');
          expect(body.resource).to.have.property('ref_type', 'tag');
          expect(body.resource).to.have.property('ref', selectedTag);
        });

        // Verify success flash message appears
        cy.expect_flash(flashClassMap.success, 'Refreshing Automate Domain');

        // Verify the explorer title shows the updated tag
        cy.get('#explorer_title_text').should('contain', selectedTag);
        cy.get('#explorer_title_text').should('contain', gitDomainName);
      });
    });
  });
});
