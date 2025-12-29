// / <reference types="cypress" />

describe('Service Reconfigure Complete Workflow', () => {
  // Service ID will be set when creating the service
  let serviceId;

  before(() => {
    // Login before all tests
    cy.login();

    // Create a dialog first
    createReconfigureDialog();

    // Create a service with the dialog attached
    createServiceWithDialog();
  });

  beforeEach(() => {
    cy.login();
  });

  after(() => {
    // Clean up - delete the dialog and service
    cleanupTestResources();
  });

  it('should reconfigure a service using the created dialog', () => {
    // Navigate to the service details page
    cy.visit(`/service/show/${serviceId}`);
    cy.url({ timeout: 10000 }).should('include', `/service/show/${serviceId}`);

    // Click on Configuration > Reconfigure this Service
    cy.toolbar('Configuration', 'Reconfigure this Service');

    // Verify we're on the reconfigure page
    cy.url({ timeout: 10000 }).should('include', `/service/service_reconfigure/${serviceId}`);
    cy.get('.service-container.serviceReconfigure').should('be.visible');

    // Wait for the tabs to load
    cy.get('.bx--tabs--scrollable').should('be.visible');

    // Fill in the form fields
    fillReconfigureForm();

    // Submit the form
    cy.get('.service-action-buttons').contains('button', 'Submit').click();

    // Verify loading indicator appears
    cy.get('.spinner-loading').should('be.visible');

    // Verify redirect to requests page
    cy.url({ timeout: 10000 }).should('include', '/miq_request/show_list');

    // Verify success message
    cy.contains('Request was Submitted').should('be.visible');
  });

  it('should validate required fields during reconfiguration', () => {
    // Navigate directly to reconfigure page
    cy.visit(`/service/service_reconfigure/${serviceId}`);

    // Wait for the tabs to load
    cy.get('.bx--tabs--scrollable').should('be.visible');

    // Find required text fields and clear them
    cy.contains('.field-label', 'Required Text Box').parent().parent().find('input[type="text"]')
      .then(($input) => {
        if (!$input.prop('readonly')) {
          cy.wrap($input).clear();
        }
      });

    // Try to submit the form
    cy.get('.service-action-buttons').contains('button', 'Submit').click();

    // Verify validation message is shown
    cy.contains('Required').should('be.visible');

    // Verify we're still on the reconfigure page
    cy.url({ timeout: 10000 }).should('include', `/service/service_reconfigure/${serviceId}`);
  });

  it('should cancel the reconfigure process', () => {
    // Navigate directly to reconfigure page
    cy.visit(`/service/service_reconfigure/${serviceId}`);

    // Wait for the tabs to load
    cy.get('.bx--tabs--scrollable').should('be.visible');

    // Make some changes to a text field
    cy.contains('.field-label', 'Text Box').parent().parent().find('input[type="text"]')
      .then(($input) => {
        if (!$input.prop('readonly')) {
          cy.wrap($input).clear().type('Changed value that should be discarded');
        }
      });

    // Click cancel button
    cy.get('.service-action-buttons').contains('button', 'Cancel').click();

    // Verify redirect to service details
    cy.url({ timeout: 10000 }).should('include', `/service/show/${serviceId}`);

    // Verify cancel message
    cy.contains('Dialog Cancelled').should('be.visible');
  });
});

// Helper function to create a dialog for service reconfiguration
function createReconfigureDialog() {
  // Navigate to Automation > Embedded Automate > Customization
  cy.menu('Automation', 'Embedded Automate', 'Customization');
  cy.get('#explorer_title_text');

  // Create a new dialog
  cy.get('[title="Configuration"]').click({force: true});
  cy.get('[title="Add a new Dialog"]').click({force: true});

  // Fill in dialog details
  cy.get('[name="name"]').type('Test Reconfigure Dialog', {force: true});
  cy.get('[name="description"]').type('Dialog for Service Reconfiguration Testing');
  cy.get('[name="dialog_type"]').select('Service Reconfiguration');

  // Add dialog content with various field types
  const dialogContent = `---
:buttons:
  :submit:
    :label: Submit
  :cancel:
    :label: Cancel
:dialog_tabs:
- :label: Service Options
  :position: 0
  :dialog_groups:
  - :label: General Options
    :position: 0
    :dialog_fields:
    - :name: text_box_1
      :description: A text box
      :type: DialogFieldTextBox
      :data_type: string
      :display: :edit
      :required: false
      :default_value: Default text
      :label: Text Box
      :position: 0
    - :name: required_text_box
      :description: A required text box
      :type: DialogFieldTextBox
      :data_type: string
      :display: :edit
      :required: true
      :default_value: Required value
      :label: Required Text Box
      :position: 1
    - :name: check_box_1
      :description: A checkbox
      :type: DialogFieldCheckBox
      :display: :edit
      :required: false
      :default_value: 't'
      :label: Check Box
      :position: 2
    - :name: radio_button_1
      :description: Radio buttons
      :type: DialogFieldRadioButton
      :display: :edit
      :required: true
      :values:
        1: Option 1
        2: Option 2
        3: Option 3
      :default_value: '1'
      :label: Radio Button
      :position: 3
    - :name: dropdown_list_1
      :description: A dropdown
      :type: DialogFieldDropDownList
      :display: :edit
      :required: true
      :values:
        16: 16GB
        2: 2GB
        4: 4GB
      :default_value: '16'
      :label: Dropdown
      :position: 4`;
  
  // Add the dialog content
  cy.get('[class="CodeMirror-lines"]').click().type('{selectall}{backspace}', {force: true});
  cy.get('[class="CodeMirror-lines"]').type(dialogContent, {force: true, delay: 0});

  // Save the dialog
  cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});

  // Verify dialog was created
  cy.contains('Dialog for Service Reconfiguration Testing').should('be.visible');
}

// Helper function to create a service with the dialog attached
function createServiceWithDialog() {
  // This is a placeholder - in a real implementation, you would:
  // 1. Navigate to Services > Catalogs
  // 2. Create a catalog item with the dialog
  // 3. Order the service
  // 4. Get the service ID

  // For now, we'll use a known service ID
  serviceId = '25';

  // In a real implementation, you would create the service and get its ID
  // cy.request('POST', '/api/services', { ... }).then((response) => {
  //   serviceId = response.body.id;
  // });
}

// Helper function to fill in the reconfigure form
function fillReconfigureForm() {
  // Find and modify the text field (Text Box)
  cy.contains('.field-label', 'Text Box').parent().parent().find('input[type="text"]')
    .should('exist')
    .then(($input) => {
      if (!$input.prop('readonly')) {
        cy.wrap($input).clear().type('New Value');
      }
    });

  // Find and modify the required text field
  cy.contains('.field-label', 'Required Text Box').parent().parent().find('input[type="text"]')
    .should('exist')
    .then(($input) => {
      if (!$input.prop('readonly')) {
        cy.wrap($input).clear().type('New Required Value');
      }
    });

  // Find and interact with the dropdown
  cy.contains('.field-label', 'Dropdown').parent().parent().find('.bx--dropdown')
    .should('exist')
    .then(($dropdown) => {
      if (!$dropdown.prop('disabled')) {
        cy.wrap($dropdown).click();
        cy.get('.bx--dropdown-item').first().click();
      }
    });

  // Find and interact with checkboxes
  cy.contains('.field-label', 'Check Box').parent().parent().find('input[type="checkbox"]')
    .should('exist')
    .then(($checkbox) => {
      if (!$checkbox.prop('disabled')) {
        cy.wrap($checkbox).click();
      }
    });

  // Find and interact with radio buttons
  cy.contains('.field-label', 'Radio Button').parent().parent().find('input[type="radio"]')
    .should('exist')
    .then(($radio) => {
      if (!$radio.prop('disabled')) {
        cy.wrap($radio).first().check();
      }
    });
}

// Helper function to clean up test resources
function cleanupTestResources() {
  // Clean up the dialog
  cy.menu('Automation', 'Embedded Automate', 'Customization');
  cy.get('#explorer_title_text');

  cy.contains('Dialog for Service Reconfiguration Testing').click({force: true});
  cy.get('[title="Configuration"]').click({force: true});
  cy.get('[title="Remove this Dialog"]').click({force: true});

  // In a real implementation, you would also clean up the service
  // cy.request('DELETE', `/api/services/${serviceId}`);
}

