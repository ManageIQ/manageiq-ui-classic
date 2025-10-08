/* eslint-disable no-undef */

describe('Settings > Application Settings Tests', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Settings', 'Application Settings');
    cy.get('#settings_server > :nth-child(5)'); // Waits for form to load or else explorer breaks
  });

  describe('Access Control', () => {
    beforeEach(() => {
      cy.get('#control_rbac_accord > .panel-title > .collapsed').click();
      cy.wait('@accordion'); // Wait for explorer screen to load
    });

    describe('Users', () => {
      it('Correctly loads admin user', () => {
        // Navigate to user list and click on Administrator user in table
        cy.get('[title="View Users"] > .content_value').click({force: true});
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Administrator') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Check Administrator user values on summary page
        cy.get('#accordion-item-15 > .bx--structured-list > .bx--structured-list-tbody > :nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(1) > .content_value > .content').contains('1');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Administrator');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('admin');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').then((val) => {
          expect(val[0].innerText).to.eq('');
        });
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-super_administrator');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-super_administrator');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(rows[index].innerText).to.eq('EvmGroup-super_administrator');
          });
        });

        // Click edit button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn > div').click();

        // Check that fields are correctly disabled and contain the correct values
        cy.get('#name').then((val) => {
          expect(val[0].disabled).to.eq(true);
          expect(val[0].defaultValue).to.eq('Administrator');
        });
        cy.get('#userid').then((val) => {
          expect(val[0].disabled).to.eq(true);
          expect(val[0].defaultValue).to.eq('admin');
        });
        cy.get('#passwordPlaceholder').then((val) => {
          expect(val[0].disabled).to.eq(true);
        });
        cy.get('#email').then((val) => {
          expect(val[0].disabled).to.eq(false);
          expect(val[0].defaultValue).to.eq('');
        });
        cy.get('#downshift-0-toggle-button').then((val) => {
          expect(val[0].disabled).to.eq(true);
        });
        cy.get('#EvmGroup-super_administrator').contains('EvmGroup-super_administrator');
      });

      it('Edit admin user', () => {
        // Navigate to user list and click on Administrator user in table
        cy.get('[title="View Users"] > .content_value').click({force: true});
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Administrator') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Click edit button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn > div').click();

        // Edit the email field since that is the only field that the Adminisistrator user can change not including the password field
        cy.get('#email').type('test@email.com');
        cy.get('.bx--btn-set > .bx--btn--primary').click();
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').contains('test@email.com'); // Check that email was correctly saved on the summary page

        // Click edit button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn > div').click();

        // Reset email back to default value of empty
        cy.get('#email').clear();
        cy.get('.bx--btn-set > .bx--btn--primary').click();
      });

      it('Create, edit and delete a user', () => {
        let groups = [];

        // Navigate to user list and click Add a new User button
        cy.get('[title="View Users"] > .content_value').click({force: true});
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();

        // Input values on the user form
        cy.get('#name').type('Cypress Test Add', {force: true});
        cy.get('#userid').type('cypressUserAdd', {force: true});
        cy.get('#password').type('cypressPass');
        cy.get('#confirmPassword').type('cypressPass');
        cy.get('#email').type('test@email.com');
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#downshift-0-menu').then((val) => {
          // Select the first group
          cy.get(val[0].children[0]).click();
          groups.push(val[0].children[0].innerText);
        });
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#selected-groups > div > p').then((selectedGroups) => {
          const nums = [...Array(selectedGroups.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(selectedGroups[index].textContent)).to.eq(true); // Check that multi select and selected groups list component work together correctly
          });
        });
        cy.get('.bx--btn-set > .bx--btn--primary').click(); // Click the add button

        // Find the new user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Add') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Verify that the new user was created with the correct values on the summary page
        cy.get(':nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Cypress Test Add');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('cypressUserAdd');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').contains('test@email.com');
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-administrator');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-administrator');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => { // Check groups list to verify user was correctly added to all selected groups
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(rows[index].innerText)).to.eq(true);
          });
        });

        // Logout of admin user and login to the new user account and logout again
        cy.get('#menu_item_logout').click();
        cy.get('#user_name').type('cypressUserAdd');
        cy.get('#user_password').type('cypressPass');
        cy.get('#login').click();
        cy.get('#menu_item_logout').click();

        // Login to admin user again and navigate to user table
        cy.login();
        cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
        cy.menu('Settings', 'Application Settings');
        cy.get('#settings_server > :nth-child(5)');
        cy.get('#control_rbac_accord > .panel-title > .collapsed').click();
        cy.wait('@accordion'); // Wait for explorer screen to load
        cy.get('[title="View Users"] > .content_value').click({force: true});

        // Find the new user in the table and click on that row
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Add') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Click the edit user button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();

        // Edit the values on the user form
        cy.get('#name').clear({force: true}).type('Cypress Test Edit', {force: true});
        cy.get('#userid').clear({force: true}).type('cypressUserEdit', {force: true});
        cy.get('.bx--col-sm-1 > .bx--btn').click();
        cy.get('#password').type('newPassword');
        cy.get('#confirmPassword').type('newPassword');
        cy.get('#email').clear().type('test_edit@email.com');
        cy.get('#downshift-0-toggle-button').click({force: true});
        groups = [];
        cy.get('#downshift-0-menu').then((val) => {
          // Unselect first group and select next two groups
          cy.get(val[0].children[0]).click();
          cy.get(val[0].children[1]).click();
          cy.get(val[0].children[2]).click();

          groups.push(val[0].children[1].innerText);
          groups.push(val[0].children[2].innerText);
        });
        cy.get('#downshift-0-toggle-button').click({force: true});
        cy.get('#selected-groups > div > p').then((selectedGroups) => {
          const nums = [...Array(selectedGroups.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(selectedGroups[index].textContent)).to.eq(true);
          });
        });
        cy.get('.bx--btn-set > .bx--btn--primary').click(); // Click save button

        // Verify that the new user was edited with the correct values on the summary page
        cy.get(':nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Cypress Test Edit');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('cypressUserEdit');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').contains('test_edit@email.com');
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-approver');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-approver');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => { // Check groups list to verify user was correctly added to all selected groups
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(rows[index].innerText)).to.eq(true);
          });
        });

        // Logout of admin user and login to the edited account and logout again
        cy.get('#menu_item_logout').click();
        cy.get('#user_name').type('cypressUserEdit');
        cy.get('#user_password').type('newPassword');
        cy.get('#login').click();
        cy.get('#menu_item_logout').click();

        // Login to admin user again and navigate to user table
        cy.login();
        cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
        cy.menu('Settings', 'Application Settings');
        cy.get('#settings_server > :nth-child(5)');
        cy.get('#control_rbac_accord > .panel-title > .collapsed').click();
        cy.wait('@accordion'); // Wait for explorer screen to load
        cy.get('[title="View Users"] > .content_value').click({force: true});

        // Find the editted user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Edit') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Click the delete user button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(3) > .bx--overflow-menu-options__btn').click();

        // Verify that the user was deleted from the table
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(rows[index].children[1].textContent).to.not.eq('Cypress Test Add');
            expect(rows[index].children[1].textContent).to.not.eq('Cypress Test Edit');
          });
        });
      });

      it('Create, copy and delete a user', () => {
        let groups = [];

        // Navigate to user list and click Add a new User button
        cy.get('[title="View Users"] > .content_value').click({force: true});
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();

        // Input values on the user form
        cy.get('#name').type('Cypress Test Add 2', {force: true});
        cy.get('#userid').type('cypressUserAdd2', {force: true});
        cy.get('#password').type('cypressPass');
        cy.get('#confirmPassword').type('cypressPass');
        cy.get('#email').type('test@email.com');
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#downshift-0-menu').then((val) => {
          // Click first two
          cy.get(val[0].children[0]).click();
          cy.get(val[0].children[1]).click();

          groups.push(val[0].children[0].innerText);
          groups.push(val[0].children[1].innerText);
        });
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#selected-groups > div > p').then((selectedGroups) => {
          const nums = [...Array(selectedGroups.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(selectedGroups[index].textContent)).to.eq(true); // Check that multi select and selected groups list component work together correctly
          });
        });
        cy.get('.bx--btn-set > .bx--btn--primary').click(); // Click the add button

        // Find the new user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Add 2') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Click copy user button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(2) > .bx--overflow-menu-options__btn').click();

        // Verify copy form was loaded with the correct values
        cy.get('#name').then((val) => {
          expect(val[0].defaultValue).to.eq('Cypress Test Add 2');
        });
        cy.get('#userid').then((val) => {
          expect(val[0].defaultValue).to.eq('');
        });
        cy.get('#password').then((val) => {
          expect(val[0].defaultValue).to.eq('');
        });
        cy.get('#confirmPassword').then((val) => {
          expect(val[0].defaultValue).to.eq('');
        });
        cy.get('#email').then((val) => {
          expect(val[0].defaultValue).to.eq('test@email.com');
        });

        // Check the multi-select and selected groups list initial selected values
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#downshift-0-menu').then((val) => {
          val[0].children.forEach((group) => {
            if (groups.includes(group.textContent)) {
              expect(group.children[0].children[0].children[0].getAttribute('data-contained-checkbox-state')).to.eq('true');
            } else {
              expect(group.children[0].children[0].children[0].getAttribute('data-contained-checkbox-state')).to.eq('false');
            }
          });
        });
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#selected-groups > div > p').then((selectedGroups) => {
          const nums = [...Array(selectedGroups.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(selectedGroups[index].textContent)).to.eq(true);
          });
        });

        // Input the new values on the copy user form
        cy.get('#name').clear().type('Cypress Test Copy');
        cy.get('#userid').type('cypressUserCopy');
        cy.get('#password').type('newPassword');
        cy.get('#confirmPassword').type('newPassword');
        cy.get('#email').clear().type('test_copy@email.com');
        cy.get('#downshift-0-toggle-button').click({force: true});
        groups = [];
        cy.get('#downshift-0-menu').then((val) => {
          // Unselect first group and leave second group selected
          cy.get(val[0].children[0]).click();

          groups.push(val[0].children[1].innerText);
        });
        cy.get('#downshift-0-toggle-button').click({force: true});
        cy.get('#selected-groups > div > p').then((selectedGroups) => {
          const nums = [...Array(selectedGroups.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(selectedGroups[index].textContent)).to.eq(true);
          });
        });
        cy.get('.bx--btn-set > .bx--btn--primary').click(); // Click the add button

        // Wait for summary page to load
        cy.get(':nth-child(1) > .label_header').contains('ID');

        // Logout of admin user and login to the new user account and logout again
        cy.get('#menu_item_logout').click();
        cy.get('#user_name').type('cypressUserAdd2');
        cy.get('#user_password').type('cypressPass');
        cy.get('#login').click();
        cy.get('#menu_item_logout').click();

        // Login to copied user then logout
        cy.get('#user_name').type('cypressUserCopy');
        cy.get('#user_password').type('newPassword');
        cy.get('#login').click();
        cy.get('#menu_item_logout').click();

        // Login to admin user again and navigate to user table
        cy.login();
        cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
        cy.menu('Settings', 'Application Settings');
        cy.get('#settings_server > :nth-child(5)');
        cy.get('#control_rbac_accord > .panel-title > .collapsed').click();
        cy.wait('@accordion'); // Wait for explorer screen to load
        cy.get('[title="View Users"] > .content_value').click({force: true});

        // Find the copied user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Copy') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Verify that the copied user was created with the correct values on the summary page
        cy.get(':nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Cypress Test Copy');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('cypressUserCopy');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').contains('test_copy@email.com');
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-approver');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-approver');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(rows[index].innerText)).to.eq(true);
          });
        });

        // Click the delete user button for the copied user
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(3) > .bx--overflow-menu-options__btn').click();

        // Find the new user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Add 2') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Verify that the new user was created with the correct values on the summary page
        cy.get(':nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Cypress Test Add 2');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('cypressUserAdd2');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').contains('test@email.com');
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-administrator');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-administrator');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(rows[index].innerText)).to.eq(true);
          });
        });

        // Click the delete user button for the new user
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(3) > .bx--overflow-menu-options__btn').click();

        // Verify that the user was deleted from the table
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(rows[index].children[1].textContent).to.not.eq('Cypress Test Add 2');
            expect(rows[index].children[1].textContent).to.not.eq('Cypress Test Edit 2');
          });
        });
      });

      it('Test Form Validation', () => {
        let groups = [];

        // Navigate to user list and click Add a new User button
        cy.get('[title="View Users"] > .content_value').click({force: true});
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();

        // Input values on the user form
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#downshift-0-menu').then((val) => {
          cy.get(val[0].children[0]).click();
          groups.push(val[0].children[0].innerText);
        });
        cy.get('#selected-groups > div > p').then((selectedGroups) => {
          const nums = [...Array(selectedGroups.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(selectedGroups[index].textContent)).to.eq(true);
          });
        });
        cy.get('#downshift-0-toggle-button').click();
        cy.get('#userid').type('cypressUserValidation', {force: true});
        cy.get('#password').type('cypressPass'); // Test password validation with non-matching passwords
        cy.get('#confirmPassword').type('incorrectPassword');
        cy.get('#email').type('emailError'); // Test email validation with bad email
        cy.get('#name').type('Cypress Test Validation', {force: true});
        cy.get('#confirmPassword-error-msg');
        cy.get('#email-error-msg');
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.disabled'); // Verify that the add button is disabled

        cy.get('#email').clear().type('test@email.com'); // Input correct email
        cy.get('#confirmPassword-error-msg'); // Verify that the confirm password error message is present
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.disabled'); // Verify that the add button is disabled

        cy.get('#confirmPassword').clear().type('newPassword'); // Enter new matching password and confirm password
        cy.get('#password').clear().type('newPassword');

        cy.get('#email').clear();

        // Verify that add button is enabled and click it
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.enabled');
        cy.get('.bx--btn-set > .bx--btn--primary').click();

        // Find the new user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Validation') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Verify that the new user was created with the correct values on the summary page
        cy.get(':nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Cypress Test Validation');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('cypressUserValidation');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').then((val) => {
          expect(val[0].innerText).to.eq('');
        });
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-administrator');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-administrator');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(rows[index].innerText)).to.eq(true);
          });
        });

        // Logout of admin user and login to the new user account and logout again
        cy.get('#menu_item_logout').click();
        cy.get('#user_name').type('cypressUserValidation');
        cy.get('#user_password').type('newPassword');
        cy.get('#login').click();
        cy.get('#menu_item_logout').click();

        // Login to admin user again and navigate to user table
        cy.login();
        cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
        cy.menu('Settings', 'Application Settings');
        cy.get('#settings_server > :nth-child(5)');
        cy.get('#control_rbac_accord > .panel-title > .collapsed').click();
        cy.wait('@accordion'); // Wait for explorer screen to load
        cy.get('[title="View Users"] > .content_value').click({force: true});

        // Find the new user in the table and click on that row
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Validation') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Click the edit user button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();

        // Edit the name field and confirm save button is enabled
        cy.get('#name').type(' Edit', { force: true });
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.enabled');

        // Verify that the password field is disabled and then after clicking the edit password button is enabled
        cy.get('#passwordPlaceholder').should('be.disabled');
        cy.get('.bx--col-sm-1 > .bx--btn').click();
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.disabled');

        // Type in matching passwords and verify save button is enabled
        cy.get('#password').type('test');
        cy.get('#confirmPassword').type('test');
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.enabled');

        // Clear confirm password field and verify save button is disabled
        cy.get('#confirmPassword').clear();
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.disabled');

        // Type incorrect value for confirm password field and verify error message is present and save button is still disabled
        cy.get('#confirmPassword').type('fail');
        cy.get('#email').type('test@email.com').clear();
        cy.get('#confirmPassword-error-msg');
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.disabled');

        // Click the cancel edit password button and verify that the save button is enabled and click it
        cy.get('.bx--col-sm-1 > .bx--btn').click();
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.enabled');
        cy.get('.bx--btn-set > .bx--btn--primary').click();

        // Verify that the user values were edited with the correct values on the summary page
        cy.get(':nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Cypress Test Validation Edit');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('cypressUserValidation');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').then((val) => {
          expect(val[0].innerText).to.eq('');
        });
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-administrator');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-administrator');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(rows[index].innerText)).to.eq(true);
          });
        });

        // Logout of admin user and login to the edited account and logout again
        cy.get('#menu_item_logout').click();
        cy.get('#user_name').type('cypressUserValidation');
        cy.get('#user_password').type('newPassword');
        cy.get('#login').click();
        cy.get('#menu_item_logout').click();

        // Login to admin user again and navigate to user table
        cy.login();
        cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
        cy.menu('Settings', 'Application Settings');
        cy.get('#settings_server > :nth-child(5)');
        cy.get('#control_rbac_accord > .panel-title > .collapsed').click();
        cy.wait('@accordion'); // Wait for explorer screen to load
        cy.get('[title="View Users"] > .content_value').click({force: true});

        // Find the editted user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Validation Edit') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Click the edit user button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();

        // Enter new matching passwords and click the save button
        cy.get('#passwordPlaceholder').should('be.disabled');
        cy.get('.bx--col-sm-1 > .bx--btn').click();
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.disabled');
        cy.get('#password').type('test');
        cy.get('#confirmPassword').type('test');
        cy.get('.bx--btn-set > .bx--btn--primary').should('be.enabled');
        cy.get('.bx--btn-set > .bx--btn--primary').click();

        // Verify that the user values remain the same on the summary page
        cy.get(':nth-child(1) > .label_header').contains('ID');
        cy.get(':nth-child(2) > .label_header').contains('Full Name');
        cy.get(':nth-child(2) > .content_value').contains('Cypress Test Validation Edit');
        cy.get(':nth-child(3) > .label_header').contains('Username');
        cy.get(':nth-child(3) > .content_value').contains('cypressUserValidation');
        cy.get(':nth-child(4) > .label_header').contains('E-mail Address');
        cy.get(':nth-child(4) > .content_value').then((val) => {
          expect(val[0].innerText).to.eq('');
        });
        cy.get(':nth-child(5) > .label_header').contains('Current Group');
        cy.get(':nth-child(5) > .content_value').contains('EvmGroup-administrator');
        cy.get(':nth-child(6) > .label_header').contains('Role');
        cy.get(':nth-child(6) > .content_value').contains('EvmRole-administrator');
        cy.get('.label_header > .bx--link > .content > .expand').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(groups.includes(rows[index].innerText)).to.eq(true);
          });
        });

        // Logout of admin user and login to the edited account with a new password and logout again
        cy.get('#menu_item_logout').click();
        cy.get('#user_name').type('cypressUserValidation');
        cy.get('#user_password').type('test');
        cy.get('#login').click();
        cy.get('#menu_item_logout').click();

        // Login to admin user again and navigate to user table
        cy.login();
        cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
        cy.menu('Settings', 'Application Settings');
        cy.get('#settings_server > :nth-child(5)');
        cy.get('#control_rbac_accord > .panel-title > .collapsed').click();
        cy.wait('@accordion'); // Wait for explorer screen to load
        cy.get('[title="View Users"] > .content_value').click({force: true});

        // Find the editted user in the table and click it
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            if (rows[index].children[1].textContent === 'Cypress Test Validation Edit') {
              cy.get(rows[index].children[1]).click({ force: true });
            }
          });
        });

        // Click the delete user button
        cy.get('#user_vmdb_choice').click();
        cy.get(':nth-child(3) > .bx--overflow-menu-options__btn').click();

        // Verify that the user was deleted from the table
        cy.get('.clickable-row').then((rows) => {
          const nums = [...Array(rows.length).keys()];
          nums.forEach((index) => {
            expect(rows[index].children[1].textContent).to.not.eq('Cypress Test Validation');
            expect(rows[index].children[1].textContent).to.not.eq('Cypress Test Validation Edit');
          });
        });
      });
    });
  });
});
