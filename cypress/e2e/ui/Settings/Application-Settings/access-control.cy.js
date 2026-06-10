import {
  LABEL_CONFIG_KEYS,
  BUTTON_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
} from '../../../../support/commands/constants/command_constants';
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Test values
const ROLE_NAME_FOR_ADD_TEST = 'Test Role';
const ROLE_NAME_FOR_EDIT_TEST = 'Edited Test Role';
const ROLE_NAME_FOR_COPY_TEST = 'Copy of Test Role';
const ROLE_NAME_FOR_VALIDATION_TEST = 'Validation Test Role';
const ROLE_NAME_FOR_PERMISSION_TEST = 'Permission Test Role';
const TENANT_NAME_FOR_PERMISSION_TEST = 'Permission Test Tenant';
const GROUP_DESCRIPTION_FOR_PERMISSION_TEST = 'Permission Test Group';
const GROUP_DETAILED_DESCRIPTION_FOR_PERMISSION_TEST = 'Permission test group detailed description';
const FULL_NAME_FOR_PERMISSION_TEST = 'Permission Test User';
const USERNAME_FOR_PERMISSION_TEST = 'permission-test-user';
const TEST_EMAIL_FOR_PERMISSION_TEST = 'permission-test-user@email.com';
const TEST_PASSWORD_FOR_PERMISSION_TEST = 'Permission-Test-Password-123';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// Accordion labels
const ACCESS_CONTROL_ACCORDION_LABEL = 'Access Control';
const MANAGEIQ_REGION_ACCORDION_LABEL = /^ManageIQ Region:/;
const ROLES_ACCORDION_LABEL = 'Roles';
const GROUPS_ACCORDION_LABEL = 'Groups';
const USERS_ACCORDION_LABEL = 'Users';

// Restriction labels
// Restriction values for select dropdowns (these are the option values, not display text)
const ONLY_USER_OWNED_VALUE = 'user';
const ONLY_USER_OR_GROUP_OWNED_VALUE = 'user_or_group';
const NONE_RESTRICTION_VALUE = '-1';

// Restriction display text for assertions (these are what appears in the UI)
const ONLY_USER_OWNED = 'Only User Owned';
const ONLY_USER_OR_GROUP_OWNED = 'Only User or Group Owned';
const NONE_RESTRICTION = 'None';

// Feature labels
const COMMON_FEATURES_IN_UI = 'Common Features in UI';
const MAIN_CONFIGURATION = 'Main Configuration';
const SETTINGS = 'Settings';

function selectToolbarOption({ toolbar = 'Configuration', option }) {
  cy.interceptApi({
    alias: 'selectToolbarOption',
    urlPattern: /\/ops\/x_button(\/\d+)?\?pressed=.*/,
    triggerFn: () => cy.toolbar(toolbar, option),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
}

function navigateToRoles() {
  cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
  cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);
  cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_LABEL, ROLES_ACCORDION_LABEL]);
}

function selectRole(roleName) {
  cy.selectAccordionItem([
    MANAGEIQ_REGION_ACCORDION_LABEL,
    ROLES_ACCORDION_LABEL,
    roleName,
  ]);
}

function getRoleInfoElementSelector(childIndex, type) {
  return `.cds--structured-list-tbody > :nth-child(${childIndex}) > .${type}`;
}

function assertRoleSummary({
  name,
  vmRestriction,
  serviceTemplateRestriction,
  checkedFeatureIds = [],
}) {
  // Check role name (row 2)
  cy.contains(getRoleInfoElementSelector(2, 'label_header'), 'Name');
  cy.contains(getRoleInfoElementSelector(2, 'content_value'), name);

  // Check VM restriction (row 3)
  cy.contains(getRoleInfoElementSelector(3, 'label_header'), 'Access Restriction for Orchestration Stacks, Key Pairs, Services, VMs, and Templates');
  cy.contains(getRoleInfoElementSelector(3, 'content_value'), vmRestriction);

  // Check Service Template restriction (row 4)
  cy.contains(getRoleInfoElementSelector(4, 'label_header'), 'Access Restriction for Catalog Items');
  cy.contains(getRoleInfoElementSelector(4, 'content_value'), serviceTemplateRestriction);

  // Check product features if provided
  checkedFeatureIds.forEach((featureId) => {
    cy.get(`li[data-id="${featureId}"]`)
      .find('i.checkbox-button')
      .should('satisfy', ($el) => {
        // Check for either fa-check-square-o or fa-check-square (different FontAwesome versions)
        return $el.hasClass('fa-check-square-o') || $el.hasClass('fa-check-square');
      });
  });
}

function checkFeature(featureLabel) {
  cy.contains('span.rct-title', featureLabel)
    .parents('span.rct-text')
    .find('input[type="checkbox"]')
    .check({ force: true });
}

function fillRoleForm({
  name,
  vmRestriction,
  serviceTemplateRestriction,
  features = [],
  clearName = false,
}) {
  if (clearName) {
    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).click({ force: true });
    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear({ force: true });
  }
  if (name !== undefined) {
    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).click({ force: true });
    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear({ force: true });
    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(name, { delay: 50, force: true });
  }
  if (vmRestriction !== undefined) {
    // Map display text to actual select values
    const vmValue = vmRestriction === ONLY_USER_OWNED ? ONLY_USER_OWNED_VALUE
      : vmRestriction === ONLY_USER_OR_GROUP_OWNED ? ONLY_USER_OR_GROUP_OWNED_VALUE
        : vmRestriction === NONE_RESTRICTION ? NONE_RESTRICTION_VALUE
          : vmRestriction;
    cy.get('select[name="vm_restriction"]').select(vmValue, { force: true });
  }
  if (serviceTemplateRestriction !== undefined) {
    // Map display text to actual select values
    const stValue = serviceTemplateRestriction === ONLY_USER_OWNED ? ONLY_USER_OWNED_VALUE
      : serviceTemplateRestriction === ONLY_USER_OR_GROUP_OWNED ? ONLY_USER_OR_GROUP_OWNED_VALUE
        : serviceTemplateRestriction === NONE_RESTRICTION ? NONE_RESTRICTION_VALUE
          : serviceTemplateRestriction;
    cy.get('select[name="service_template_restriction"]').select(stValue, { force: true });
  }
  features.forEach(checkFeature);
}

function saveRole(buttonText = 'Add') {
  cy.interceptApi({
    alias: 'saveRoleApi',
    urlPattern: /\/api\/roles(\/\d+)?$/,
    waitOnlyIfRequestIntercepted: true,
    triggerFn: () =>
      cy
        .getFormButtonByTypeWithText({
          buttonText,
          buttonType: 'submit',
        })
        .click({ force: true }),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
  cy.expect_flash(flashClassMap.success, 'saved');
}

function navigateToGroups() {
  cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
  cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);
  cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_LABEL, GROUPS_ACCORDION_LABEL]);
}

function navigateToUsers() {
  cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
  cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);
  cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_LABEL, USERS_ACCORDION_LABEL]);
}

function selectBootstrapDropdownOption(buttonSelector, optionText) {
  cy.get(buttonSelector).click();
  cy.get(`${buttonSelector} ~ .dropdown-menu`).contains('a', optionText).click();
}

function createTenantViaFactory({ name, description = 'Test tenant description' }) {
  return cy.appFactories([
    [
      'create',
      'tenant',
      {
        name,
        description,
      },
    ],
  ]);
}

function createGroup({ description, detailedDescription, role, tenant = 'My Company' }) {
  navigateToGroups();
  selectToolbarOption({ option: 'Add a new Group' });
  cy.get('#description').click({ force: true });
  cy.get('#description').clear({ force: true });
  cy.get('#description').type(description, { delay: 50, force: true });
  cy.get('#detailed_description').click({ force: true });
  cy.get('#detailed_description').clear({ force: true });
  cy.get('#detailed_description').type(detailedDescription, { delay: 50, force: true });
  selectBootstrapDropdownOption('.btn[data-id="group_role"]', role);
  selectBootstrapDropdownOption('.btn[data-id="group_tenant"]', tenant);
  cy.getFormButtonByTypeWithText({
    buttonText: 'Add',
    buttonType: 'submit',
  }).click();
  cy.expect_flash(flashClassMap.success, 'saved');
}

function selectFromMultiSelect(optionsToClick) {
  cy.contains(
    'button#downshift-0-toggle-button',
    'Choose one or more Groups'
  ).click();
  optionsToClick.forEach((option) => {
    cy.contains('#downshift-0-menu .cds--list-box__menu-item', option).click();
  });
  cy.contains(
    'button#downshift-0-toggle-button',
    'Choose one or more Groups'
  ).click();
}

function createUser({
  fullName,
  userName,
  password,
  email,
  groups,
}) {
  navigateToUsers();
  selectToolbarOption({ option: 'Add a new User' });
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(fullName, { delay: 50, force: true });
  cy.getFormInputFieldByIdAndType({ inputId: 'userid' }).type(userName, { delay: 50, force: true });
  cy.getFormInputFieldByIdAndType({
    inputId: 'password',
    inputType: 'password',
  }).type(password, { delay: 50, force: true });
  cy.getFormInputFieldByIdAndType({
    inputId: 'confirmPassword',
    inputType: 'password',
  }).type(password, { delay: 50, force: true });
  cy.getFormInputFieldByIdAndType({ inputId: 'email' }).type(email, { delay: 50, force: true });
  selectFromMultiSelect(groups);
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
  cy.expect_flash(flashClassMap.success, 'saved');
}

describe('Settings > Application Settings > Access Control > Roles', () => {
  beforeEach(() => {
    cy.login();
    navigateToRoles();
  });

  describe('Validate role permissions and actions', () => {
    it('Correctly loads an existing role', () => {
      selectRole('EvmRole-administrator');

      assertRoleSummary({
        name: 'EvmRole-administrator',
        vmRestriction: 'None',
        serviceTemplateRestriction: 'None',
      });
    });

    it('Cancels adding a new role', () => {
      selectToolbarOption({ option: 'Add a new Role' });

      cy.expect_explorer_title('Adding a new Role');
      cy.validateFormLabels([
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'name',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'Name',
        },
      ]);
      cy.validateFormFields([
        {
          [FIELD_CONFIG_KEYS.ID]: 'name',
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: '',
        },
      ]);
      cy.validateFormButtons([
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Add',
          [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
          [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
        },
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Cancel',
        },
      ]);

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click({ force: true });
      cy.expect_explorer_title('Access Control Roles');
      cy.expect_flash(flashClassMap.warning, 'cancelled by the user');
    });

    it('Creates, edits and deletes a role', () => {
      selectToolbarOption({ option: 'Add a new Role' });

      fillRoleForm({
        name: ROLE_NAME_FOR_ADD_TEST,
        vmRestriction: ONLY_USER_OWNED,
        serviceTemplateRestriction: ONLY_USER_OWNED,
        features: [COMMON_FEATURES_IN_UI],
      });

      saveRole('Add');

      selectRole(ROLE_NAME_FOR_ADD_TEST);
      assertRoleSummary({
        name: ROLE_NAME_FOR_ADD_TEST,
        vmRestriction: ONLY_USER_OWNED,
        serviceTemplateRestriction: ONLY_USER_OWNED,
        checkedFeatureIds: ['0.12'],
      });

      selectToolbarOption({ option: 'Edit this Role' });

      // Clear and type new name to avoid empty/disabled state
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).click({ force: true });
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear({ force: true });
      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(ROLE_NAME_FOR_EDIT_TEST, { delay: 50, force: true });

      fillRoleForm({
        vmRestriction: ONLY_USER_OR_GROUP_OWNED,
        serviceTemplateRestriction: ONLY_USER_OR_GROUP_OWNED,
        features: [MAIN_CONFIGURATION],
      });

      saveRole('Save');

      selectRole(ROLE_NAME_FOR_EDIT_TEST);
      assertRoleSummary({
        name: ROLE_NAME_FOR_EDIT_TEST,
        vmRestriction: ONLY_USER_OR_GROUP_OWNED,
        serviceTemplateRestriction: ONLY_USER_OR_GROUP_OWNED,
        checkedFeatureIds: ['0.12', '0.11'],
      });

      selectToolbarOption({ option: 'Delete this Role' });
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.get('.list-group').should('not.contain', ROLE_NAME_FOR_EDIT_TEST);
    });

    it('Creates, copies and deletes roles', () => {
      selectToolbarOption({ option: 'Add a new Role' });

      fillRoleForm({
        name: ROLE_NAME_FOR_ADD_TEST,
        vmRestriction: ONLY_USER_OWNED,
        serviceTemplateRestriction: ONLY_USER_OWNED,
        features: [COMMON_FEATURES_IN_UI],
      });

      saveRole('Add');

      selectRole(ROLE_NAME_FOR_ADD_TEST);
      selectToolbarOption({ option: 'Copy this Role to a new Role' });

      cy.validateFormFields([
        {
          [FIELD_CONFIG_KEYS.ID]: 'name',
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: ROLE_NAME_FOR_COPY_TEST,
        },
      ]);
      // Verify and explicitly select the restriction values using actual option values
      cy.get('select[name="vm_restriction"]').select(ONLY_USER_OWNED_VALUE, { force: true });
      cy.get('select[name="service_template_restriction"]').select(ONLY_USER_OWNED_VALUE, { force: true });

      saveRole('Add');

      selectRole(ROLE_NAME_FOR_COPY_TEST);
      assertRoleSummary({
        name: ROLE_NAME_FOR_COPY_TEST,
        vmRestriction: ONLY_USER_OWNED,
        serviceTemplateRestriction: ONLY_USER_OWNED,
        checkedFeatureIds: ['0.12'],
      });

      selectToolbarOption({ option: 'Delete this Role' });
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.get('.list-group').should('not.contain', ROLE_NAME_FOR_COPY_TEST);

      selectRole(ROLE_NAME_FOR_ADD_TEST);
      selectToolbarOption({ option: 'Delete this Role' });
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.get('.list-group').should('not.contain', ROLE_NAME_FOR_ADD_TEST);
    });

    it('Resets role edits and preserves original permissions', () => {
      selectToolbarOption({ option: 'Add a new Role' });

      fillRoleForm({
        name: ROLE_NAME_FOR_ADD_TEST,
        vmRestriction: ONLY_USER_OWNED,
        serviceTemplateRestriction: ONLY_USER_OWNED,
        features: [COMMON_FEATURES_IN_UI],
      });

      saveRole('Add');

      selectRole(ROLE_NAME_FOR_ADD_TEST);
      selectToolbarOption({ option: 'Edit this Role' });

      fillRoleForm({
        name: ROLE_NAME_FOR_EDIT_TEST,
        vmRestriction: ONLY_USER_OR_GROUP_OWNED,
        serviceTemplateRestriction: ONLY_USER_OR_GROUP_OWNED,
        clearName: true,
      });

      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.enabled');
      cy.getFormButtonByTypeWithText({ buttonText: 'Reset' }).should('be.enabled').click({ force: true });

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).should('have.value', ROLE_NAME_FOR_ADD_TEST);
      cy.get('select[name="vm_restriction"]').should('contain.text', ONLY_USER_OWNED);
      cy.get('select[name="service_template_restriction"]').should('contain.text', ONLY_USER_OWNED);
      cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).should('be.disabled');

      cy.getFormButtonByTypeWithText({ buttonText: 'Cancel' }).click({ force: true });
      selectRole(ROLE_NAME_FOR_ADD_TEST);
      assertRoleSummary({
        name: ROLE_NAME_FOR_ADD_TEST,
        vmRestriction: ONLY_USER_OWNED,
        serviceTemplateRestriction: ONLY_USER_OWNED,
        checkedFeatureIds: ['0.12'],
      });

      selectToolbarOption({ option: 'Delete this Role' });
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.get('.list-group').should('not.contain', ROLE_NAME_FOR_ADD_TEST);
    });

    it('Validates required role permissions before allowing submit', () => {
      selectToolbarOption({ option: 'Add a new Role' });

      cy.validateFormButtons([
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Add',
          [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
          [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
        },
      ]);

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(ROLE_NAME_FOR_VALIDATION_TEST, { delay: 50, force: true });
      cy.getFormButtonByTypeWithText({
        buttonText: 'Add',
        buttonType: 'submit',
      }).should('be.disabled');

      checkFeature(COMMON_FEATURES_IN_UI);
      cy.getFormButtonByTypeWithText({
        buttonText: 'Add',
        buttonType: 'submit',
      }).should('be.enabled');

      cy.get('select[name="vm_restriction"]').select(NONE_RESTRICTION_VALUE, { force: true });
      cy.get('select[name="service_template_restriction"]').select(NONE_RESTRICTION_VALUE, { force: true });

      saveRole('Add');

      selectRole(ROLE_NAME_FOR_VALIDATION_TEST);
      assertRoleSummary({
        name: ROLE_NAME_FOR_VALIDATION_TEST,
        vmRestriction: 'None',
        serviceTemplateRestriction: 'None',
        checkedFeatureIds: ['0.12'],
      });

      selectToolbarOption({ option: 'Delete this Role' });
      cy.expect_flash(flashClassMap.success, 'delete');
      cy.get('.list-group').should('not.contain', ROLE_NAME_FOR_VALIDATION_TEST);
    });

    it('Creates a role, group and user and verifies the new user permissions', () => {
      selectToolbarOption({ option: 'Add a new Role' });

      fillRoleForm({
        name: ROLE_NAME_FOR_PERMISSION_TEST,
        vmRestriction: NONE_RESTRICTION,
        serviceTemplateRestriction: NONE_RESTRICTION,
        features: [COMMON_FEATURES_IN_UI, MAIN_CONFIGURATION, SETTINGS],
      });

      saveRole('Add');

      selectRole(ROLE_NAME_FOR_PERMISSION_TEST);
      assertRoleSummary({
        name: ROLE_NAME_FOR_PERMISSION_TEST,
        vmRestriction: 'None',
        serviceTemplateRestriction: 'None',
        checkedFeatureIds: ['0.12', '0.11'],
      });

      // Create tenant via factory and wait for it to complete
      createTenantViaFactory({
        name: TENANT_NAME_FOR_PERMISSION_TEST,
        description: 'Tenant for permission test',
      }).then((createdTenantData) => {
        expect(createdTenantData.length).to.equal(1);

        createGroup({
          description: GROUP_DESCRIPTION_FOR_PERMISSION_TEST,
          detailedDescription: GROUP_DETAILED_DESCRIPTION_FOR_PERMISSION_TEST,
          role: ROLE_NAME_FOR_PERMISSION_TEST,
          tenant: TENANT_NAME_FOR_PERMISSION_TEST,
        });

        createUser({
          fullName: FULL_NAME_FOR_PERMISSION_TEST,
          userName: USERNAME_FOR_PERMISSION_TEST,
          password: TEST_PASSWORD_FOR_PERMISSION_TEST,
          email: TEST_EMAIL_FOR_PERMISSION_TEST,
          groups: [GROUP_DESCRIPTION_FOR_PERMISSION_TEST],
        });
      });

      cy.menu('Logout');
      cy.login(USERNAME_FOR_PERMISSION_TEST, TEST_PASSWORD_FOR_PERMISSION_TEST);

      cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
      cy.accordion(ACCESS_CONTROL_ACCORDION_LABEL);
      cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_LABEL, ROLES_ACCORDION_LABEL]);
      cy.get('.list-group').should('contain', ROLE_NAME_FOR_PERMISSION_TEST);

      cy.selectAccordionItem([MANAGEIQ_REGION_ACCORDION_LABEL, ROLES_ACCORDION_LABEL, ROLE_NAME_FOR_PERMISSION_TEST]);
      assertRoleSummary({
        name: ROLE_NAME_FOR_PERMISSION_TEST,
        vmRestriction: 'None',
        serviceTemplateRestriction: 'None',
        checkedFeatureIds: ['0.12', '0.11'],
      });
    });

    afterEach(() => {
      cy.appDbState('restore');
    });
  });
});
