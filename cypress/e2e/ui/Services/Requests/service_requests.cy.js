/* eslint-disable no-undef */
import moment from 'moment';
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  FIELD_TYPES,
  BUTTON_CONFIG_KEYS,
} from '../../../../support/commands/constants/command_constants';

// Menu options
const SERVICES_MENU_OPTION = 'Services';
const REQUESTS_MENU_OPTION = 'Requests';

// Field labels
const FORM_HEADER = 'Requests';
const REQUESTER_LABEL = 'Requester';
const APPROVAL_STATE_HEADER = 'Approval State';
const TYPE_LABEL = 'Type';
const REQUEST_DATE_LABEL = 'Request Date';
const REASON_LABEL = 'Reason';

// Field values
const SELECT_OPTION_ALL = 'all';
const TYPE_VM_RECONFIGURE = 'vm_reconfigure';
const REQUEST_DATE_LAST_7_DAYS = '7';
const REQUEST_DATE_LAST_30_DAYS = '30';

// Checkbox labels
const PENDING_APPROVAL_LABEL = 'Pending Approval';
const APPROVED_LABEL = 'Approved';
const DENIED_LABEL = 'Denied';

// Button texts
const APPLY_BUTTON_TEXT = 'Apply';
const RESET_BUTTON_TEXT = 'Reset';

/**
 * Function to do assertions on table data
 */
function assertGtlData({ columnIndex, expectedRowCount, rowContainsText }) {
  cy.gtlGetRows([columnIndex]).then((data) => {
    expect(data.length).to.equal(expectedRowCount);
    if (rowContainsText) {
      expect(data[0][0]).to.include(rowContainsText);
    }
  });
}

describe('Automate Service Requests form operations: Services > Requests', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Verify form fields', () => {
    it('Verify form’s initial UI state', () => {
      cy.menu(SERVICES_MENU_OPTION, REQUESTS_MENU_OPTION);
      cy.contains('#main-content h1', FORM_HEADER);
      cy.getFormLegendByText({ legendText: APPROVAL_STATE_HEADER });
      cy.validateFormLabels([
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'selectedUser',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: REQUESTER_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'types',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: TYPE_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'selectedPeriod',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: REQUEST_DATE_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'reasonText',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: REASON_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'approvalStates-pending_approval',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: PENDING_APPROVAL_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'approvalStates-approved',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: APPROVED_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'approvalStates-denied',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: DENIED_LABEL,
        },
      ]);
      cy.validateFormFields([
        {
          [FIELD_CONFIG_KEYS.ID]: 'selectedUser',
          [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: SELECT_OPTION_ALL,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'approvalStates-pending_approval',
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'checkbox',
          [FIELD_CONFIG_KEYS.SHOULD_BE_CHECKED]: true,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'approvalStates-approved',
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'checkbox',
          [FIELD_CONFIG_KEYS.SHOULD_BE_CHECKED]: true,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'approvalStates-denied',
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'checkbox',
          [FIELD_CONFIG_KEYS.SHOULD_BE_CHECKED]: true,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'types',
          [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: SELECT_OPTION_ALL,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'selectedPeriod',
          [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: REQUEST_DATE_LAST_7_DAYS,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'reasonText',
        },
      ]);
      cy.validateFormButtons([
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: APPLY_BUTTON_TEXT,
          [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
        },
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: RESET_BUTTON_TEXT,
        },
      ]);
      cy.expect_gtl_no_records_with_text();
    });
  });

  describe('Validate button click actions', () => {
    beforeEach(() => {
      const today = moment().format();

      cy.appFactories([
        [
          'create',
          'service_template_provision_request',
          {
            description: 'Cypress mock data for approval state: Approved',
            approval_state: 'approved',
            type: 'ServiceTemplateProvisionRequest',
            fulfilled_on: today,
            request_type: 'clone_to_service',
            request_state: 'finished',
            message: 'Cypress mock data for approval state: Approved',
            status: 'Ok',
          },
        ],
        [
          'create',
          'service_template_provision_request',
          {
            description: 'Cypress mock data for approval state: Denied',
            approval_state: 'denied',
            type: 'ServiceTemplateProvisionRequest',
            fulfilled_on: today,
            request_type: 'clone_to_service',
            request_state: 'finished',
            message: 'Cypress mock data for approval state: Denied',
            status: 'Ok',
          },
        ],
        [
          'create',
          'vm_reconfigure_request',
          {
            description:
              'Cypress mock data for approval state: Pending-Approval',
            approval_state: 'pending_approval',
            type: 'VmReconfigureRequest',
            request_type: TYPE_VM_RECONFIGURE,
            request_state: 'pending',
            message: 'Cypress mock data for approval state: Pending-Approval',
            status: 'Ok',
          },
        ],
        // This record is used to filter data for requests made in the last 30 days
        [
          'create',
          'service_template_provision_request',
          {
            description:
              'Cypress mock data for request made in the last 30 days',
            approval_state: 'approved',
            type: 'ServiceTemplateProvisionRequest',
            created_on: moment().subtract(10, 'days'),
            fulfilled_on: today,
            request_type: 'clone_to_service',
            request_state: 'finished',
            message: 'Cypress mock data for request made in the last 30 days',
            status: 'Ok',
          },
        ],
      ]).then((createdRequestsData) => {
        expect(createdRequestsData.length).to.equal(4);
        cy.menu(SERVICES_MENU_OPTION, REQUESTS_MENU_OPTION);
      });
    });

    it('Validate reset & apply buttons', () => {
      /* Reset */
      cy.getFormSelectFieldById({ selectId: 'selectedUser' }).then(
        (selectElement) => {
          const value = [...selectElement[0].options].find(
            (option) => option.value !== SELECT_OPTION_ALL
          ).value;
          cy.wrap(selectElement).select(value);
        }
      );
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-pending_approval',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-pending_approval',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-approved',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-approved',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-denied',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-denied',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormSelectFieldById({ selectId: 'types' }).select(
        TYPE_VM_RECONFIGURE
      );
      cy.getFormSelectFieldById({ selectId: 'selectedPeriod' }).select(
        'Last 30 Days'
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'reasonText' }).type(
        'Testing'
      );
      cy.getFormButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      cy.getFormSelectFieldById({ selectId: 'selectedUser' }).should(
        'have.value',
        SELECT_OPTION_ALL
      );
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-pending_approval',
        inputType: 'checkbox',
      }).should('be.checked');
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-approved',
        inputType: 'checkbox',
      }).should('be.checked');
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-denied',
        inputType: 'checkbox',
      }).should('be.checked');
      cy.getFormSelectFieldById({ selectId: 'types' }).should(
        'have.value',
        SELECT_OPTION_ALL
      );
      cy.getFormSelectFieldById({ selectId: 'selectedPeriod' }).should(
        'have.value',
        REQUEST_DATE_LAST_7_DAYS
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'reasonText' }).should(
        'have.value',
        ''
      );
      /* Apply */
      // Filter data with approval state: Denied
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-pending_approval',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-pending_approval',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-approved',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-approved',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      assertGtlData({
        columnIndex: 7,
        expectedRowCount: 1,
        rowContainsText: DENIED_LABEL,
      });
      cy.getFormButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      assertGtlData({ columnIndex: 0, expectedRowCount: 3 });
      // Filter data with approval state: Approved
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-pending_approval',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-pending_approval',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-denied',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-denied',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      assertGtlData({
        columnIndex: 7,
        expectedRowCount: 1,
        rowContainsText: APPROVED_LABEL,
      });
      cy.getFormButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      assertGtlData({ columnIndex: 0, expectedRowCount: 3 });
      // Filter data with approval state: Pending approval
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-approved',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-approved',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-denied',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-denied',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      assertGtlData({
        columnIndex: 7,
        expectedRowCount: 1,
        rowContainsText: PENDING_APPROVAL_LABEL,
      });
      cy.getFormButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      assertGtlData({ columnIndex: 0, expectedRowCount: 3 });
      // Filter data with type: VM Reconfigure
      cy.getFormSelectFieldById({ selectId: 'types' }).select(
        TYPE_VM_RECONFIGURE
      );
      cy.getFormButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      assertGtlData({
        columnIndex: 4,
        expectedRowCount: 1,
        rowContainsText: 'VM Reconfigure',
      });
      cy.getFormButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      assertGtlData({ columnIndex: 0, expectedRowCount: 3 });
      // Filter data with request date: last 30 days
      cy.getFormSelectFieldById({ selectId: 'selectedPeriod' }).select(
        REQUEST_DATE_LAST_30_DAYS
      );
      cy.getFormButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      assertGtlData({
        columnIndex: 6,
        expectedRowCount: 4,
        rowContainsText: 'request made in the last 30 days',
      });
      // Filter data with reason text
      cy.getFormInputFieldByIdAndType({ inputId: 'reasonText' }).type('r@ndOm');
      cy.getFormButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_gtl_no_records_with_text();
      cy.getFormButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      assertGtlData({ columnIndex: 0, expectedRowCount: 3 });
    });

    afterEach(() => {
      cy.appDbState('restore');
    });
  });
});
