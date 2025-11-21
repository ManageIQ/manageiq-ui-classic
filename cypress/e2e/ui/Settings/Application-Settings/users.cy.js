/* eslint-disable no-undef */
import {
  LABEL_CONFIG_KEYS,
  BUTTON_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
} from '../../../../support/commands/constants/command_constants';
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Field values
const EVM_GROUP_SUPER_ADMIN = 'EvmGroup-super_administrator';
const EVM_GROUP_ADMIN = 'EvmGroup-administrator';
const EVM_GROUP_APPROVER = 'EvmGroup-approver';
const EVM_GROUP_AUDITOR = 'EvmGroup-auditor';
const EVM_ROLE_SUPER_ADMIN = 'EvmRole-super_administrator';
const EVM_ROLE_APPROVER = 'EvmRole-approver';
const EVM_ROLE_ADMIN = 'EvmRole-administrator';
const FULL_NAME_FOR_ADD_TEST = 'Add Test-Full Name';
const USERNAME_FOR_ADD_TEST = 'Add-Test-User';
const FULL_NAME_FOR_EDIT_TEST = 'Edit Test-Full Name';
const USERNAME_FOR_EDIT_TEST = 'Edit-Test-User';
const FULL_NAME_FOR_COPY_TEST = 'Copy Test-Full Name';
const USERNAME_FOR_COPY_TEST = 'Copy-Test-User';
const TEST_EMAIL = 'test@email.com';
const TEST_PASS_WORD = 'Test-Password-123';
const UPDATED_TEST_PASS_WORD = 'Test-Updated-Password-123';
const UPDATED_TEST_EMAIL = 'test_edit@email.com';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';
const LOGOUT_MENU_OPTION = 'Logout';

// Accordion labels
const ACCESS_CONTROL_ACCORDION_LABEL = 'Access Control';
const MANAGEIQ_REGION_ACCORDION_LABEL = /^ManageIQ Region:/;
const USERS_ACCORDION_LABEL = 'Users';

function selectToolbarOption({ toolbar = 'Configuration', option }) {
  cy.interceptApi({
    alias: 'selectToolbarOption',
    urlPattern: /\/ops\/x_button(\/\d+)?\?pressed=.*/,
    triggerFn: () => cy.toolbar(toolbar, option),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
}

function assertSelectedGroups(selectedGroups, parentSelector, childSelector) {
  cy.get(parentSelector).within(() => {
    selectedGroups.forEach((item) => {
      cy.get(childSelector).should('contain.text', item);
    });
  });
}

// TODO: Add command for this component if seen more often across tests
function selectFromMultiSelect(optionsToClick) {
  // Expanding the select list
  cy.contains(
    'button#downshift-0-toggle-button',
    'Choose one or more Groups'
  ).click();
  optionsToClick.forEach((option) => {
    cy.contains('#downshift-0-menu .bx--list-box__menu-item', option).click();
  });
  // Collapsing the select list
  cy.contains(
    'button#downshift-0-toggle-button',
    'Choose one or more Groups'
  ).click();
}

function getUserInfoElementSelector(childIndex, type) {
  return `ul.settings_schedule_user_information .bx--structured-list-tbody > :nth-child(${childIndex}) > .${type}`;
}

function assertUserInformation({
  fullName,
  userName,
  email,
  currentGroup,
  role,
  selectedGroups = [],
}) {
  cy.contains(getUserInfoElementSelector(1, 'label_header'), 'ID');
  cy.contains(getUserInfoElementSelector(2, 'label_header'), 'Full Name');
  cy.contains(getUserInfoElementSelector(2, 'content_value'), fullName);
  cy.contains(getUserInfoElementSelector(3, 'label_header'), 'Username');
  cy.contains(getUserInfoElementSelector(3, 'content_value'), userName);
  cy.contains(getUserInfoElementSelector(4, 'label_header'), 'E-mail Address');
  email
    ? cy.contains(getUserInfoElementSelector(4, 'content_value'), email)
    : cy
        .get(getUserInfoElementSelector(4, 'content_value'))
        .invoke('text')
        .should('be.empty');
  cy.contains(getUserInfoElementSelector(5, 'label_header'), 'Current Group');
  cy.contains(getUserInfoElementSelector(5, 'content_value'), currentGroup);
  cy.contains(getUserInfoElementSelector(6, 'label_header'), 'Role');
  cy.contains(getUserInfoElementSelector(6, 'content_value'), role);
  assertSelectedGroups(
    selectedGroups,
    'ul.settings_schedule_groups_information',
    '.bx--link .content .expand'
  );
}

describe('Settings > Application Settings > Users', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
    cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);
  });

  describe('Validate admin user actions', () => {
    it('Correctly loads admin user', () => {
      // Navigate to user list and click on Administrator user in table
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        'Administrator',
      ]);

      // Check Administrator user values on summary page
      assertUserInformation({
        fullName: 'Administrator',
        userName: 'admin',
        email: '',
        currentGroup: EVM_GROUP_SUPER_ADMIN,
        role: EVM_ROLE_SUPER_ADMIN,
        selectedGroups: [EVM_GROUP_SUPER_ADMIN],
      });

      // Click edit button
      selectToolbarOption({ option: 'Edit this User' });

      // Check that fields are correctly disabled and contain the correct values
      cy.expect_explorer_title('Administrator');
      cy.validateFormLabels([
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'name',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'Full Name',
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'userid',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'Username',
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'email',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'E-mail Address',
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'downshift-0-toggle-button',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'Available Groups',
        },
      ]);
      cy.getFormLegendByText({ legendText: 'Password' }).should('be.visible');
      cy.contains('form label#selected-groups-label', 'Selected Groups');
      cy.contains('form #selected-groups', 'EvmGroup-super_administrator');
      cy.validateFormFields([
        {
          [FIELD_CONFIG_KEYS.ID]: 'name',
          [FIELD_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: 'Administrator',
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'userid',
          [FIELD_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: 'admin',
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'passwordPlaceholder',
          [FIELD_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'password',
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'email',
        },
      ]);
      cy.contains(
        'form button#downshift-0-toggle-button',
        'Choose one or more Groups'
      ).should('be.disabled');
      cy.validateFormButtons([
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Submit',
          [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
          [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
        },
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Reset',
          [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
        },
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Cancel',
        },
      ]);
    });

    it('Edit admin user', () => {
      // Navigate to user list and click on Administrator user in table
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        'Administrator',
      ]);
      selectToolbarOption({ option: 'Edit this User' });

      // Edit the email field since that is the only field that the Adminisistrator user can change not including the password field
      cy.getFormInputFieldByIdAndType({ inputId: 'email' }).type(TEST_EMAIL);
      cy.interceptApi({
        alias: 'saveUserInfoApi',
        urlPattern: /\/api\/users\/\d+$/,
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Submit',
              buttonType: 'submit',
            })
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      });
      // Check that email was correctly saved on the summary page
      cy.contains(
        getUserInfoElementSelector(4, 'label_header'),
        'E-mail Address'
      );
      cy.contains(getUserInfoElementSelector(4, 'content_value'), TEST_EMAIL);

      // Reset email back to default value of empty
      selectToolbarOption({ option: 'Edit this User' });
      cy.getFormInputFieldByIdAndType({ inputId: 'email' }).clear();
      cy.interceptApi({
        alias: 'saveUserInfoApi',
        urlPattern: /\/api\/users\/\d+$/,
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Submit',
              buttonType: 'submit',
            })
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      });
    });
  });

  describe('Validate new user actions', () => {
    it('Create, edit and delete a user', () => {
      // Navigate to user list and click Add a new User button
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
      ]);
      selectToolbarOption({ option: 'Add a new User' });

      // Input values on the user form
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        FULL_NAME_FOR_ADD_TEST
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'userid' }).type(
        USERNAME_FOR_ADD_TEST
      );
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).type(TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({ inputId: 'email' }).type(TEST_EMAIL);
      selectFromMultiSelect([EVM_GROUP_ADMIN]);
      assertSelectedGroups(
        [EVM_GROUP_ADMIN],
        '#selected-groups',
        'p.group-name'
      );
      cy.interceptApi({
        alias: 'addUserApi',
        urlPattern: '/api/users',
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Add',
              buttonType: 'submit',
            })
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      }).then(() => {
        cy.expect_flash(flashClassMap.success, 'saved');
        cy.selectAccordionItem([
          MANAGEIQ_REGION_ACCORDION_LABEL,
          USERS_ACCORDION_LABEL,
          FULL_NAME_FOR_ADD_TEST,
        ]);
      });

      // Verify that the new user was created with the correct values on the summary page
      assertUserInformation({
        fullName: FULL_NAME_FOR_ADD_TEST,
        userName: USERNAME_FOR_ADD_TEST,
        email: TEST_EMAIL,
        currentGroup: EVM_GROUP_ADMIN,
        role: EVM_ROLE_ADMIN,
        selectedGroups: [EVM_GROUP_ADMIN],
      });

      // Logout of admin user and login to the new user account and logout again
      cy.menu(LOGOUT_MENU_OPTION);
      cy.login(USERNAME_FOR_ADD_TEST, TEST_PASS_WORD);
      cy.menu(LOGOUT_MENU_OPTION);

      // Login to admin user again and navigate to user table
      cy.login();
      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);

      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        FULL_NAME_FOR_ADD_TEST,
      ]);

      // Click the edit user button
      selectToolbarOption({ option: 'Edit this User' });

      // Edit the values on the user form
      cy.getFormInputFieldByIdAndType({ inputId: 'name' })
        .clear()
        .type(FULL_NAME_FOR_EDIT_TEST);
      cy.getFormInputFieldByIdAndType({ inputId: 'userid' })
        .clear()
        .type(USERNAME_FOR_EDIT_TEST);
      cy.get('.bx--col-sm-1 > .bx--btn').click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({ inputId: 'email' })
        .clear()
        .type(UPDATED_TEST_EMAIL);
      // Unselecting admin and selecting approver & auditor options
      selectFromMultiSelect([
        EVM_GROUP_ADMIN,
        EVM_GROUP_APPROVER,
        EVM_GROUP_AUDITOR,
      ]);

      assertSelectedGroups(
        [EVM_GROUP_APPROVER, EVM_GROUP_AUDITOR],
        '#selected-groups',
        'p.group-name'
      );
      cy.interceptApi({
        alias: 'saveUserInfoApi',
        urlPattern: /\/api\/users\/\d+$/,
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Submit',
              buttonType: 'submit',
            })
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      });

      // Verify that the new user was edited with the correct values on the summary page
      assertUserInformation({
        fullName: FULL_NAME_FOR_EDIT_TEST,
        userName: USERNAME_FOR_EDIT_TEST,
        email: UPDATED_TEST_EMAIL,
        currentGroup: EVM_GROUP_APPROVER,
        role: EVM_ROLE_APPROVER,
        selectedGroups: [EVM_GROUP_APPROVER, EVM_GROUP_AUDITOR],
      });

      // Logout of admin user and login to the edited account and logout again
      cy.menu(LOGOUT_MENU_OPTION);
      cy.login(USERNAME_FOR_EDIT_TEST, UPDATED_TEST_PASS_WORD);
      cy.menu(LOGOUT_MENU_OPTION);

      // Login to admin user again and navigate to user table
      cy.login();
      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);

      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        FULL_NAME_FOR_EDIT_TEST,
      ]);

      selectToolbarOption({ option: 'Delete this User' });
      cy.expect_flash(flashClassMap.success, 'delete');

      // Verify that the user was deleted from the table
      cy.get('.miq-data-table table tbody tr').should(
        'not.contain',
        FULL_NAME_FOR_EDIT_TEST
      );
    });

    it('Create, copy and delete a user', () => {
      // Navigate to user list and click Add a new User button
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
      ]);
      selectToolbarOption({ option: 'Add a new User' });

      // Input values on the user form
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        FULL_NAME_FOR_ADD_TEST
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'userid' }).type(
        USERNAME_FOR_ADD_TEST
      );
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).type(TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({ inputId: 'email' }).type(TEST_EMAIL);
      selectFromMultiSelect([EVM_GROUP_ADMIN, EVM_GROUP_APPROVER]);
      assertSelectedGroups(
        [EVM_GROUP_ADMIN, EVM_GROUP_APPROVER],
        '#selected-groups',
        'p.group-name'
      );
      cy.interceptApi({
        alias: 'addUserApi',
        urlPattern: '/api/users',
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Add',
              buttonType: 'submit',
            })
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      }).then(() => {
        cy.expect_flash(flashClassMap.success, 'saved');
        cy.selectAccordionItem([
          MANAGEIQ_REGION_ACCORDION_LABEL,
          USERS_ACCORDION_LABEL,
          FULL_NAME_FOR_ADD_TEST,
        ]);
      });

      // Verify copy form was loaded with the correct values
      // Click copy user button
      selectToolbarOption({ option: 'Copy this User to a new User' });
      cy.validateFormFields([
        {
          [FIELD_CONFIG_KEYS.ID]: 'name',

          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: FULL_NAME_FOR_ADD_TEST,
        },

        {
          [FIELD_CONFIG_KEYS.ID]: 'email',
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: TEST_EMAIL,
        },
      ]);
      // Check the selected groups list initial selected values
      assertSelectedGroups(
        [EVM_GROUP_ADMIN, EVM_GROUP_APPROVER],
        '#selected-groups',
        'p.group-name'
      );

      // Input the new values on the copy user form
      cy.getFormInputFieldByIdAndType({ inputId: 'name' })
        .clear()
        .type(FULL_NAME_FOR_COPY_TEST);
      cy.getFormInputFieldByIdAndType({ inputId: 'userid' }).type(
        USERNAME_FOR_COPY_TEST
      );
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({ inputId: 'email' })
        .clear()
        .type(UPDATED_TEST_EMAIL);
      // Admin group is already selected so unselect it and leave approver group selected
      selectFromMultiSelect([EVM_GROUP_ADMIN]);
      assertSelectedGroups(
        [EVM_GROUP_APPROVER],
        '#selected-groups',
        'p.group-name'
      );
      cy.interceptApi({
        alias: 'addUserApi',
        urlPattern: '/api/users',
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Add',
              buttonType: 'submit',
            })
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      });

      // Logout of admin user and login to the new user account and logout again
      cy.menu(LOGOUT_MENU_OPTION);
      cy.login(USERNAME_FOR_ADD_TEST, TEST_PASS_WORD);
      cy.menu(LOGOUT_MENU_OPTION);

      // Login to copied user then logout
      cy.login(USERNAME_FOR_COPY_TEST, UPDATED_TEST_PASS_WORD);
      cy.menu(LOGOUT_MENU_OPTION);

      // Login to admin user again and navigate to user table
      cy.login();
      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);

      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        FULL_NAME_FOR_COPY_TEST,
      ]);

      // Verify that the copied user was created with the correct values on the summary page
      assertUserInformation({
        fullName: FULL_NAME_FOR_COPY_TEST,
        userName: USERNAME_FOR_COPY_TEST,
        email: UPDATED_TEST_EMAIL,
        currentGroup: EVM_GROUP_APPROVER,
        role: EVM_ROLE_APPROVER,
        selectedGroups: [EVM_GROUP_APPROVER],
      });

      // Click the delete user button for the copied user
      selectToolbarOption({ option: 'Delete this User' });
      cy.expect_flash(flashClassMap.success, 'delete');
      // Verify that the user was deleted from the table
      cy.get('.miq-data-table table tbody tr').should(
        'not.contain',
        FULL_NAME_FOR_COPY_TEST
      );

      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        FULL_NAME_FOR_ADD_TEST,
      ]);

      // Verify that the new user was created with the correct values on the summary page
      assertUserInformation({
        fullName: FULL_NAME_FOR_ADD_TEST,
        userName: USERNAME_FOR_ADD_TEST,
        email: TEST_EMAIL,
        currentGroup: EVM_GROUP_ADMIN,
        role: EVM_ROLE_ADMIN,
        selectedGroups: [EVM_GROUP_ADMIN, EVM_GROUP_APPROVER],
      });

      // Click the delete user button for the new user
      selectToolbarOption({ option: 'Delete this User' });
      cy.expect_flash(flashClassMap.success, 'delete');
      // Verify that the user was deleted from the table
      cy.get('.miq-data-table table tbody tr').should(
        'not.contain',
        FULL_NAME_FOR_ADD_TEST
      );
    });

    it('Test Form Validation', () => {
      // Navigate to user list and click Add a new User button
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
      ]);
      selectToolbarOption({ option: 'Add a new User' });

      // Input values on the user form
      selectFromMultiSelect([EVM_GROUP_ADMIN]);
      assertSelectedGroups(
        [EVM_GROUP_ADMIN],
        '#selected-groups',
        'p.group-name'
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'userid' }).type(
        USERNAME_FOR_ADD_TEST
      );
      // Test password validation with non-matching passwords
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).type(TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      // Test email validation with an invalid email
      cy.getFormInputFieldByIdAndType({ inputId: 'email' }).type('test@123');
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        FULL_NAME_FOR_ADD_TEST
      );
      cy.contains('#confirmPassword-error-msg', 'do not match').should(
        'be.visible'
      );
      cy.contains('#email-error-msg', 'valid email').should('be.visible');
      // Verify that the add button is still disabled
      cy.getFormButtonByTypeWithText({
        buttonText: 'Add',
        buttonType: 'submit',
      }).should('be.disabled');
      // Input correct email
      cy.getFormInputFieldByIdAndType({ inputId: 'email' })
        .clear()
        .type(TEST_EMAIL);
      // Enter matching password
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      })
        .clear()
        .type(TEST_PASS_WORD);
      cy.get('#confirmPassword-error-msg').should('not.exist');
      cy.get('#email-error-msg').should('not.exist');
      // Verify that add button is now enabled and click it
      cy.interceptApi({
        alias: 'addUserApi',
        urlPattern: '/api/users',
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Add',
              buttonType: 'submit',
            })
            .should('be.enabled')
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      }).then(() => {
        cy.selectAccordionItem([
          MANAGEIQ_REGION_ACCORDION_LABEL,
          USERS_ACCORDION_LABEL,
          FULL_NAME_FOR_ADD_TEST,
        ]);
      });

      // Verify that the new user was created with the correct values on the summary page
      assertUserInformation({
        fullName: FULL_NAME_FOR_ADD_TEST,
        userName: USERNAME_FOR_ADD_TEST,
        email: TEST_EMAIL,
        currentGroup: EVM_GROUP_ADMIN,
        role: EVM_ROLE_ADMIN,
        selectedGroups: [EVM_GROUP_ADMIN],
      });

      // Logout of admin user and login to the new user account and logout again
      cy.menu(LOGOUT_MENU_OPTION);
      cy.login(USERNAME_FOR_ADD_TEST, TEST_PASS_WORD);
      cy.menu(LOGOUT_MENU_OPTION);

      // Login to admin user again and navigate to user table
      cy.login();
      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);

      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        FULL_NAME_FOR_ADD_TEST,
      ]);

      // Click the edit user button
      selectToolbarOption({ option: 'Edit this User' });

      // Edit the name field and confirm submit & reset buttons are enabled
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(' Edited');
      cy.getFormButtonByTypeWithText({
        buttonText: 'Submit',
        buttonType: 'submit',
      }).should('be.enabled');
      cy.getFormButtonByTypeWithText({
        buttonText: 'Reset',
      })
        .should('be.enabled')
        .click();
      cy.expect_flash(flashClassMap.warning, 'reset');

      // Verify that the password field is disabled and then after clicking the edit password button, it is enabled
      cy.getFormInputFieldByIdAndType({
        inputId: 'passwordPlaceholder',
        inputType: 'password',
      }).should('be.disabled');
      cy.get('.bx--col-sm-1 > .bx--btn').click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).should('be.enabled');

      // Type in matching passwords and verify submit button is enabled
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.getFormButtonByTypeWithText({
        buttonText: 'Submit',
        buttonType: 'submit',
      }).should('be.enabled');

      // Clear confirm password field and verify submit button is disabled
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).clear();
      cy.getFormButtonByTypeWithText({
        buttonText: 'Submit',
        buttonType: 'submit',
      }).should('be.disabled');

      // Type incorrect value for confirm password field and verify error message is present and submit button is still disabled
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(TEST_PASS_WORD);
      // TODO:
      cy.getFormLabelByForAttribute({ forValue: 'confirmPassword' }).click();
      cy.contains('#confirmPassword-error-msg', 'do not match').should(
        'be.visible'
      );
      cy.getFormButtonByTypeWithText({
        buttonText: 'Submit',
        buttonType: 'submit',
      }).should('be.disabled');

      // Click the cancel edit password button, update name field and verify that the submit button is now enabled & click it
      cy.get('.bx--col-sm-1 > .bx--btn').click();
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(' Edited');

      cy.interceptApi({
        alias: 'saveUserInfoApi',
        urlPattern: /\/api\/users\/\d+$/,
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Submit',
              buttonType: 'submit',
            })
            .should('be.enabled')
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      });
      // Verify that user info is displayed as expected on the summary page
      assertUserInformation({
        fullName: `${FULL_NAME_FOR_ADD_TEST} Edited`,
        userName: USERNAME_FOR_ADD_TEST,
        email: TEST_EMAIL,
        currentGroup: EVM_GROUP_ADMIN,
        role: EVM_ROLE_ADMIN,
        selectedGroups: [EVM_GROUP_ADMIN],
      });

      // Logout of admin user and login to the edited account and logout again
      cy.menu(LOGOUT_MENU_OPTION);
      cy.login(USERNAME_FOR_ADD_TEST, TEST_PASS_WORD);
      cy.menu(LOGOUT_MENU_OPTION);

      // Login to admin user again and navigate to user table
      cy.login();
      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        `${FULL_NAME_FOR_ADD_TEST} Edited`,
      ]);

      // Click the edit user button
      selectToolbarOption({ option: 'Edit this User' });

      // Enter new matching passwords and click the submit button
      cy.get('.bx--col-sm-1 > .bx--btn').click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'password',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.getFormInputFieldByIdAndType({
        inputId: 'confirmPassword',
        inputType: 'password',
      }).type(UPDATED_TEST_PASS_WORD);
      cy.interceptApi({
        alias: 'saveUserInfoApi',
        urlPattern: /\/api\/users\/\d+$/,
        triggerFn: () =>
          cy
            .getFormButtonByTypeWithText({
              buttonText: 'Submit',
              buttonType: 'submit',
            })
            .click(),
        onApiResponse: (interception) =>
          expect(interception.response.statusCode).to.equal(200),
      });

      // Verify that the user values remain the same on the summary page
      assertUserInformation({
        fullName: `${FULL_NAME_FOR_ADD_TEST} Edited`,
        userName: USERNAME_FOR_ADD_TEST,
        email: TEST_EMAIL,
        currentGroup: EVM_GROUP_ADMIN,
        role: EVM_ROLE_ADMIN,
        selectedGroups: [EVM_GROUP_ADMIN],
      });

      // Logout of admin user, login to the edited account with the new password and logout again
      cy.menu(LOGOUT_MENU_OPTION);
      cy.login(USERNAME_FOR_ADD_TEST, UPDATED_TEST_PASS_WORD);
      cy.menu(LOGOUT_MENU_OPTION);

      // Login to admin user again and navigate to user table
      cy.login();
      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_LABEL,
        USERS_ACCORDION_LABEL,
        `${FULL_NAME_FOR_ADD_TEST} Edited`,
      ]);
      cy.expect_explorer_title(`${FULL_NAME_FOR_ADD_TEST} Edited`);
    });

    afterEach(() => {
      cy.appDbState('restore');
    });
  });
});
