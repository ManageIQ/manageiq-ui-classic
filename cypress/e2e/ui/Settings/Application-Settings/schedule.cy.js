/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer';

// List items
const SCHEDULES_ACCORDION_ITEM = 'Schedules';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;

// Field values
const BASIC_INFO_SUB_HEADER = 'Basic Information';
const NAME_FIELD_LABEL = 'Name';
const DESCRIPTION_FIELD_LABEL = 'Description';
const ACTIVE_CHECKBOX_FIELD_LABEL = 'Active';
const ACTION_TYPE_FIELD_LABEL = 'Action';
const FILTER_TYPE_FIELD_LABEL = 'Filter';
const ZONE_FIELD_LABEL = 'Zone';
const OBJECT_DETAILS_SUB_HEADER = 'Object Details';
const SYSTEM_FIELD_LABEL = 'System/Process';
const MESSAGE_FIELD_LABEL = 'Message';
const REQUEST_FIELD_LABEL = 'Request';
const OBJECT_LABEL_TEXT = 'Object';
const OBJECT_TYPE_FIELD_LABEL = 'Type';
const OBJECT_TYPE_CLOUD_NETWORK = 'Cloud Network';
const ATTRIBUTE_PAIRS_SUB_HEADER = 'Attribute/Value Pairs';
const TIMER_TYPE_FIELD_LABEL = 'Run';
const TIMER_VALUE_FIELD_LABEL = 'Every';
const TIME_ZONE_FIELD_LABEL = 'Time Zone';
const START_DATE_FIELD_LABEL = 'Starting Date';
const START_TIME_FIELD_LABEL = 'Starting Time';
const INITIAL_SCHEDULE_NAME = 'Test-name';
const EDITED_SCHEDULE_NAME = 'Dummy-name';
const INITIAL_DESCRIPTION = 'Test description';
const EDITED_DESCRIPTION = 'Dummy description';
const ACTION_TYPE_VM_ANALYSIS = 'vm';
const ACTION_TYPE_TEMPLATE_ANALYSIS = 'miq_template';
const ACTION_TYPE_HOST_ANALYSIS = 'host';
const ACTION_TYPE_CONTAINER_ANALYSIS = 'container_image';
const ACTION_TYPE_CLUSTER_ANALYSIS = 'emscluster';
const ACTION_TYPE_DATA_STORE_ANALYSIS = 'storage';
const ACTION_TYPE_VM_COMPILANCE_CHECK = 'vm_check_compliance';
const ACTION_TYPE_HOST_COMPILANCE_CHECK = 'host_check_compliance';
const ACTION_TYPE_CONTAINER_COMPILANCE_CHECK =
  'container_image_check_compliance';
const ACTION_TYPE_AUTOMATION_TASKS = 'automation_request';
const TIMER_TYPE_ONCE = 'Once';
const TIMER_TYPE_HOURLY = 'Hourly';
const TIMER_TYPE_DAILY = 'Daily';
const TIMER_TYPE_WEEKLY = 'Weekly';
const TIMER_TYPE_MONTHLY = 'Monthly';
const FREQUENCY_TYPE_HOUR = '1 Hour';
const TIME_ZONE_TYPE_HAWAII = '(GMT-10:00) Hawaii';
const INITIAL_START_DATE = '06/30/2025';
const EDITED_START_DATE = '07/21/2025';
const START_TIME = '11:23';

// Buttons
const SAVE_BUTTON_TEXT = 'Save';
const CANCEL_BUTTON_TEXT = 'Cancel';
const RESET_BUTTON_TEXT = 'Reset';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const ADD_SCHEDULE_CONFIG_OPTION = 'Add a new Schedule';
const DELETE_SCHEDULE_CONFIG_OPTION = 'Delete this Schedule from the Database';
const EDIT_SCHEDULE_CONFIG_OPTION = 'Edit this Schedule';
const DISABLE_SCHEDULE_CONFIG_OPTION = 'Disable this Schedule';
const ENABLE_SCHEDULE_CONFIG_OPTION = 'Enable this Schedule';
const QUEUE_SCHEDULE_CONFIG_OPTION = 'Queue up this Schedule to run now';

// Menu options
const SETTINGS_OPTION = 'Settings';
const APP_SETTINGS_OPTION = 'Application Settings';

// Flash message text snippets
const FLASH_MESSAGE_SCHEDULE_QUEUED = 'queued';
const FLASH_MESSAGE_OPERATION_CANCELED = 'cancel';
const FLASH_MESSAGE_SCHEDULE_DISABLED = 'disabled';
const FLASH_MESSAGE_SCHEDULE_ENABLED = 'enabled';
const FLASH_MESSAGE_SCHEDULE_SAVED = 'saved';
const FLASH_MESSAGE_RESET_SCHEDULE = 'reset';
const FLASH_MESSAGE_SCHEDULE_DELETED = 'delete';
const FLASH_MESSAGE_FAILED_TO_ADD_SCHEDULE = 'failed';

// Browser alert text snippets
const BROWSER_ALERT_DELETE_CONFIRM_TEXT = 'removed';

function selectConfigMenu(menuOption) {
  return cy.toolbar(CONFIG_TOOLBAR_BUTTON, menuOption);
}

function addSchedule() {
  selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);
  cy.getFormFooterButtonByTypeWithText({
    buttonText: SAVE_BUTTON_TEXT,
    buttonType: 'submit',
  }).should('be.disabled');
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
    INITIAL_SCHEDULE_NAME
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
    INITIAL_DESCRIPTION
  );
  cy.getFormLabelByForAttribute({ forValue: 'enabled' }).click();
  cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
    ACTION_TYPE_VM_ANALYSIS
  );
  cy.getFormSelectFieldById({ selectId: 'filter_typ' }).select(
    ACTION_TYPE_VM_ANALYSIS
  );
  cy.getFormSelectFieldById({ selectId: 'timer_typ' }).select(
    TIMER_TYPE_HOURLY
  );
  cy.getFormSelectFieldById({ selectId: 'timer_value' }).select(
    FREQUENCY_TYPE_HOUR
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'time_zone' }).click();
  cy.contains('[role="option"]', TIME_ZONE_TYPE_HAWAII).click();
  cy.getFormInputFieldByIdAndType({ inputId: 'start_date' }).type(
    INITIAL_START_DATE
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'start_time' }).type(START_TIME);
  cy.interceptApi({
    alias: 'addScheduleApi',
    urlPattern: '/ops/schedule_edit/new?button=save',
    triggerFn: () =>
      cy
        .getFormFooterButtonByTypeWithText({
          buttonText: SAVE_BUTTON_TEXT,
          buttonType: 'submit',
        })
        .should('be.enabled') // Checks if Save button is enabled once all required fields are filled
        .click(),
  });
  return cy.then(() => {
    return INITIAL_SCHEDULE_NAME;
  });
}

function clickScheduleItem(scheduleName) {
  cy.selectAccordionItem([
    MANAGEIQ_REGION_ACCORDION_ITEM,
    SCHEDULES_ACCORDION_ITEM,
    scheduleName,
  ]);
}

function deleteSchedule(scheduleName) {
  clickScheduleItem(scheduleName);
  cy.expect_browser_confirm_with_text({
    confirmTriggerFn: () => selectConfigMenu(DELETE_SCHEDULE_CONFIG_OPTION),
    containsText: BROWSER_ALERT_DELETE_CONFIRM_TEXT,
  });
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_DELETED);
}

describe('Automate Schedule form operations: Settings > Application Settings > Settings > Schedules > Configuration > Add a new schedule', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_OPTION, APP_SETTINGS_OPTION);
    cy.accordion(SETTINGS_OPTION);
    cy.selectAccordionItem([
      MANAGEIQ_REGION_ACCORDION_ITEM,
      SCHEDULES_ACCORDION_ITEM,
    ]);
  });

  it('Validate visibility of elements and dynamic rendering based on dropdown changes', () => {
    selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);
    cy.contains('h3', BASIC_INFO_SUB_HEADER).should('be.visible');
    cy.getFormLabelByForAttribute({ forValue: 'name' })
      .should('be.visible')
      .and('contain.text', NAME_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'name' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormLabelByForAttribute({ forValue: 'description' })
      .should('be.visible')
      .and('contain.text', DESCRIPTION_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormLabelByForAttribute({ forValue: 'enabled' })
      .should('be.visible')
      .and('contain.text', ACTIVE_CHECKBOX_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({
      inputId: 'enabled',
      inputType: 'checkbox',
    })
      .should('be.visible')
      .and('be.enabled');

    /* ===== Selecting any option other than "Automation Tasks" from "Action" dropdown does not hide the Filter dropdown ===== */
    cy.getFormLabelByForAttribute({ forValue: 'action_typ' })
      .should('be.visible')
      .and('contain.text', ACTION_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'action_typ' })
      .should('be.visible')
      .and('be.enabled')
      .select(ACTION_TYPE_VM_ANALYSIS);
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_TEMPLATE_ANALYSIS
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_HOST_ANALYSIS
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_CONTAINER_ANALYSIS
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_CLUSTER_ANALYSIS
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_DATA_STORE_ANALYSIS
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_VM_COMPILANCE_CHECK
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_HOST_COMPILANCE_CHECK
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_CONTAINER_COMPILANCE_CHECK
    );
    cy.getFormLabelByForAttribute({ forValue: 'filter_typ' })
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'filter_typ' })
      .should('be.visible')
      .and('be.enabled');

    /* ===== Selecting "Automation Tasks" option from "Action" dropdown should show Zone, Object details & Object fields ===== */
    cy.getFormSelectFieldById({ selectId: 'action_typ' }).select(
      ACTION_TYPE_AUTOMATION_TASKS
    );
    cy.getFormLabelByForAttribute({ forValue: 'zone_id' })
      .should('be.visible')
      .and('contain.text', ZONE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'zone_id' })
      .should('be.visible')
      .and('be.enabled');

    // Verifying Object Details fields
    cy.contains('h3[name="object_details"]', OBJECT_DETAILS_SUB_HEADER).should(
      'be.visible'
    );
    cy.getFormLabelByForAttribute({ forValue: 'instance_name' })
      .should('be.visible')
      .and('contain.text', SYSTEM_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'instance_name' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormLabelByForAttribute({ forValue: 'message' })
      .should('be.visible')
      .and('contain.text', MESSAGE_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'message' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormLabelByForAttribute({ forValue: 'request' })
      .should('be.visible')
      .and('contain.text', REQUEST_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'request' })
      .should('be.visible')
      .and('be.enabled');

    // Verifying Object fields
    cy.contains('h3[name="object_attributes"]', OBJECT_LABEL_TEXT).should(
      'be.visible'
    );
    cy.getFormLabelByForAttribute({ forValue: 'target_class' })
      .should('be.visible')
      .and('contain.text', OBJECT_TYPE_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'target_class' })
      .should('be.visible')
      .and('be.enabled')
      .click();
    cy.contains('[role="option"]', OBJECT_TYPE_CLOUD_NETWORK).click();
    cy.getFormLabelByForAttribute({ forValue: 'target_id' })
      .should('be.visible')
      .and('contain.text', OBJECT_LABEL_TEXT);
    cy.getFormInputFieldByIdAndType({ inputId: 'target_id' })
      .should('be.visible')
      .and('be.enabled');

    // Verifying Attribute/Value pairs fields
    cy.contains('h3', ATTRIBUTE_PAIRS_SUB_HEADER).should('be.visible');
    cy.getFormInputFieldByIdAndType({ inputId: 'attribute_1' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'value_1' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'attribute_2' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'value_2' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'attribute_3' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'value_3' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'attribute_4' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'value_4' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'attribute_5' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldByIdAndType({ inputId: 'value_5' })
      .should('be.visible')
      .and('be.enabled');

    /* ===== Selecting "Once" option from "Run" dropdown should not show "Every" dropdown ===== */
    cy.getFormLabelByForAttribute({ forValue: 'timer_typ' })
      .should('be.visible')
      .and('contain.text', TIMER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'timer_typ' })
      .should('be.visible')
      .and('be.enabled')
      .select(TIMER_TYPE_ONCE);
    cy.getFormInputFieldByIdAndType({ inputId: 'timer_value' }).should(
      'not.exist'
    );

    /* ===== Selecting any other option other than "Once" from "Run" dropdown should show "Every" dropdown ===== */
    cy.getFormSelectFieldById({ selectId: 'timer_typ' }).select(
      TIMER_TYPE_HOURLY
    );
    cy.getFormLabelByForAttribute({ forValue: 'timer_value' })
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'timer_value' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'timer_typ' }).select(
      TIMER_TYPE_DAILY
    );
    cy.getFormLabelByForAttribute({ forValue: 'timer_value' })
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'timer_value' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'timer_typ' }).select(
      TIMER_TYPE_WEEKLY
    );
    cy.getFormLabelByForAttribute({ forValue: 'timer_value' })
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'timer_value' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormSelectFieldById({ selectId: 'timer_typ' }).select(
      TIMER_TYPE_MONTHLY
    );
    cy.getFormLabelByForAttribute({ forValue: 'timer_value' })
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById({ selectId: 'timer_value' })
      .should('be.visible')
      .and('be.enabled');

    cy.getFormLabelByForAttribute({ forValue: 'time_zone' })
      .should('be.visible')
      .and('contain.text', TIME_ZONE_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'time_zone' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormLabelByForAttribute({ forValue: 'start_date' })
      .should('be.visible')
      .and('contain.text', START_DATE_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'start_date' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormLabelByForAttribute({ forValue: 'start_time' })
      .should('be.visible')
      .and('contain.text', START_TIME_FIELD_LABEL);
    cy.getFormInputFieldByIdAndType({ inputId: 'start_time' })
      .should('be.visible')
      .and('be.enabled');
    cy.getFormFooterButtonByTypeWithText({
      buttonText: SAVE_BUTTON_TEXT,
      buttonType: 'submit',
    })
      .should('be.visible')
      .and('be.disabled');
    cy.getFormFooterButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT })
      .should('be.visible')
      .and('be.enabled');
  });

  it('Checking whether Cancel button works on the Add form', () => {
    selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  it('Checking whether add, edit & delete schedule works', () => {
    addSchedule().then((createdScheduleName) => {
      // createdScheduleName value will be "Test-name"
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_SAVED);
      clickScheduleItem(createdScheduleName);
    });

    selectConfigMenu(EDIT_SCHEDULE_CONFIG_OPTION);
    cy.getFormInputFieldByIdAndType({ inputId: 'name' })
      .clear()
      .type(EDITED_SCHEDULE_NAME);
    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(EDITED_DESCRIPTION);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: SAVE_BUTTON_TEXT,
      buttonType: 'submit',
    })
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_SAVED);

    /* ===== Delete is already handled from afterEach hook ===== */
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    addSchedule().then((createdScheduleName) => {
      // createdScheduleName value will be "Test-name"
      clickScheduleItem(createdScheduleName);
    });

    /* ===== Checking whether Reset button works ===== */
    selectConfigMenu(EDIT_SCHEDULE_CONFIG_OPTION);
    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(EDITED_DESCRIPTION);
    cy.getFormInputFieldByIdAndType({ inputId: 'start_date' })
      .clear()
      .type(EDITED_START_DATE);
    cy.getFormFooterButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET_SCHEDULE);
    cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should(
      'have.value',
      INITIAL_DESCRIPTION
    );
    cy.getFormInputFieldByIdAndType({ inputId: 'start_date' }).should(
      'have.value',
      INITIAL_START_DATE
    );

    /* ===== Checking whether Cancel button works ===== */
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  it('Checking whether creating a duplicate record is restricted', () => {
    addSchedule();
    addSchedule();
    cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_FAILED_TO_ADD_SCHEDULE);
  });

  it('Checking whether Disabling, Enabling & Queueing up the schedule works', () => {
    addSchedule();
    clickScheduleItem(INITIAL_SCHEDULE_NAME);

    /* ===== Disabling the schedule ===== */
    selectConfigMenu(DISABLE_SCHEDULE_CONFIG_OPTION);
    cy.expect_flash(flashClassMap.info, FLASH_MESSAGE_SCHEDULE_DISABLED);

    /* ===== Enabling the schedule ===== */
    selectConfigMenu(ENABLE_SCHEDULE_CONFIG_OPTION);
    cy.expect_flash(flashClassMap.info, FLASH_MESSAGE_SCHEDULE_ENABLED);

    /* ===== Queueing-up the schedule ===== */
    selectConfigMenu(QUEUE_SCHEDULE_CONFIG_OPTION);
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_QUEUED);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });
});
