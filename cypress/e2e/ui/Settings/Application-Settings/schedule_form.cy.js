/* eslint-disable no-undef */

function addSchedule() {
  cy.get("#miq_schedule_vmdb_choice").click();
  cy.get('ul[aria-label="Configuration"] [title="Add a new Schedule"]').click();
  // Checks if Save button is disabled initially
  cy.contains(
    '#main-content .bx--btn-set button[type="submit"]',
    "Save"
  ).should("be.disabled");
  // Adding data
  cy.get("input#name").type("Test name");
  cy.get("input#description").type("Test description");
  cy.get('input[type="checkbox"]#enabled').check({ force: true });
  cy.get("select#action_typ").select("VM Analysis");
  cy.get("select#filter_typ").select("A single VM");
  cy.get("select#timer_typ").select("Hourly");
  cy.get("select#timer_value").select("1 Hour");
  cy.get('input[role="combobox"]#time_zone').click();
  cy.contains('[role="option"]', "(GMT-10:00) Hawaii")
    .should("be.visible")
    .click();
  cy.get("input#start_date").type("06/30/2025", { force: true });
  cy.get("input#start_time").type("11:23");
  // Checks if Save button is enabled once all required fields are filled
  cy.contains('#main-content .bx--btn-set button[type="submit"]', "Save")
    .should("be.enabled")
    .click();
}

describe("Settings > Application Settings > Settings > Schedules > Configuration > Add a new schedule", () => {
  beforeEach(() => {
    cy.login();
    cy.menu("Settings", "Application Settings");
    cy.get('[title="Schedules"]')
      .click()
      .then(() => {
        cy.get("#miq_schedule_vmdb_choice").click();
        cy.get(
          'ul[aria-label="Configuration"] [title="Add a new Schedule"]'
        ).click();
      });
  });

  describe("Automate schedule form operations", () => {
    it("Validate visibility of elements based on dropdown selections", () => {
      /* Selecting any option other than "Automation Tasks" from "Action" dropdown does not hide the Filter dropdown */

      cy.get("select#action_typ").select("VM Analysis");
      cy.get("select#action_typ").should("have.value", "vm");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("Template Analysis");
      cy.get("select#action_typ").should("have.value", "miq_template");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("Host Analysis");
      cy.get("select#action_typ").should("have.value", "host");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("Container Image Analysis");
      cy.get("select#action_typ").should("have.value", "container_image");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("Cluster Analysis");
      cy.get("select#action_typ").should("have.value", "emscluster");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("Datastore Analysis");
      cy.get("select#action_typ").should("have.value", "storage");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("VM Compliance Check");
      cy.get("select#action_typ").should("have.value", "vm_check_compliance");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("Host Compliance Check");
      cy.get("select#action_typ").should("have.value", "host_check_compliance");
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      cy.get("select#action_typ").select("Container Image Compliance Check");
      cy.get("select#action_typ").should(
        "have.value",
        "container_image_check_compliance"
      );
      // Checking for Filter type dropdown
      cy.get('label[for="filter_typ"]').should("exist");
      cy.get("select#filter_typ").should("exist");

      /* Selecting "Automation Tasks" option from "Action" dropdown shows Zone, Object details & Object fields */

      cy.get("select#action_typ").select("Automation Tasks");
      cy.get("select#action_typ").should("have.value", "automation_request");

      // Checking for Zone dropdown
      cy.get('label[for="zone_id"]').should("exist");
      cy.get("select#zone_id").should("exist");

      // Checking for Object Details
      cy.get('h3[name="object_details"]').should("exist");
      // Checking for System/Process dropdown
      cy.get('label[for="instance_name"]').should("exist");
      cy.get("select#instance_name").should("exist");
      // Checking for Messsage textfield
      cy.get('label[for="message"]').should("exist");
      cy.get("input#message").should("exist");
      // Checking for Request textfield
      cy.get('label[for="request"]').should("exist");
      cy.get("input#request").should("exist");

      // Checking for Object
      cy.get('h3[name="object_attributes"]').should("exist");
      // Checking for Type Combobox
      cy.get('label[for="target_class"]').should("exist");
      cy.get('input[role="combobox"]#target_class').should("exist");
      // Checking for Object Combobox
      cy.get('label[for="target_id"]').should("exist");
      cy.get('input[role="combobox"]#target_id').should("exist");

      // Checking for Attribute/Value pairs
      cy.contains("h3", "Attribute/Value Pairs").should("exist");
      // Checking for 5 attribute-value pairs text fields
      cy.get("input#attribute_1").should("exist");
      cy.get("input#value_1").should("exist");
      cy.get("input#attribute_2").should("exist");
      cy.get("input#value_2").should("exist");
      cy.get("input#attribute_3").should("exist");
      cy.get("input#value_3").should("exist");
      cy.get("input#attribute_4").should("exist");
      cy.get("input#value_4").should("exist");
      cy.get("input#attribute_5").should("exist");
      cy.get("input#value_5").should("exist");

      /* Selecting "Once" option from "Run" dropdown does not show the "Every" dropdown */

      cy.get("select#timer_typ").select("Once");
      // Checking whether the Every dropdown is hidden
      cy.get("input#timer_value").should("not.exist");

      /* Selecting any other option other than "Once" from "Run" dropdown shows the "Every" dropdown */

      cy.get("select#timer_typ").select("Hours", { force: true });
      // Checking whether the "Every" dropdown exist
      cy.get('label[for="timer_value"]').should("exist");
      cy.get("select#timer_value").should("exist");

      cy.get("select#timer_typ").select("Days", { force: true });
      // Checking whether the "Every" dropdown exist
      cy.get('label[for="timer_value"]').should("exist");
      cy.get("select#timer_value").should("exist");

      cy.get("select#timer_typ").select("Weeks", { force: true });
      // Checking whether the "Every" dropdown exist
      cy.get('label[for="timer_value"]').should("exist");
      cy.get("select#timer_value").should("exist");

      cy.get("select#timer_typ").select("Months", { force: true });
      // Checking whether the "Every" dropdown exist
      cy.get('label[for="timer_value"]').should("exist");
      cy.get("select#timer_value").should("exist");
    });

    it("Can add, edit, enable, disable, queue-up and delete a schedule", () => {
      /* Checking whether Cancel button works on the add form */

      cy.contains('#main-content .bx--btn-set button[type="button"]', "Cancel")
        .should("be.enabled")
        .click();
      cy.get("#main_div #flash_msg_div .alert-success").contains(
        "Add was cancelled by the user"
      );

      /* Checking whether adding a schedule works */

      addSchedule();
      cy.get("#main_div #flash_msg_div .alert-success").contains(
        'Schedule "Test name" was saved'
      );

      /* Checking whether creating a duplicate record is restricted */

      addSchedule();
      cy.get("#main_div #flash_msg_div .alert-danger").contains(
        "Error when adding a new schedule: Validation failed: MiqSchedule: Name has already been taken"
      );

      // Selecting the created schedule
      cy.contains("li.list-group-item", "Test name").click();

      /* Checking whether Cancel button works on the Edit form */

      cy.get("#miq_schedule_vmdb_choice").click();
      cy.get(
        'ul[aria-label="Configuration"] [title="Edit this Schedule"]'
      ).click();
      cy.contains('#main-content .bx--btn-set button[type="button"]', "Cancel")
        .should("be.enabled")
        .click();
      cy.get("#main_div #flash_msg_div .alert-success").contains(
        'Edit of "Test name" was cancelled by the user'
      );

      /* Checking whether Reset button works on the Edit form */

      cy.get("#miq_schedule_vmdb_choice").click();
      cy.get(
        'ul[aria-label="Configuration"] [title="Edit this Schedule"]'
      ).click();
      // Editing description and start date
      cy.get("input#description").clear().type("Dummy description");
      cy.get("input#start_date").clear().type("07/21/2025", { force: true });
      cy.contains('#main-content .bx--btn-set button[type="button"]', "Reset")
        .should("be.enabled")
        .click();
      cy.get("#main_div #flash_msg_div .alert-warning").contains(
        "All changes have been reset"
      );
      // Confirming the edited fields contain the old value
      cy.get("input#description").should("have.value", "Test description");
      cy.get("input#start_date").should("have.value", "06/30/2025");

      /* Checking whether Edit functionality works */

      // Editing name and description
      cy.get("input#name").clear().type("Dummy name");
      cy.get("input#description").clear().type("Dummy description");
      // Confirms Save button is enabled after making edits
      cy.contains('#main-content .bx--btn-set button[type="submit"]', "Save")
        .should("be.enabled")
        .click();
      cy.get("#main_div #flash_msg_div .alert-success").contains(
        'Schedule "Dummy name" was saved'
      );

      /* Checking whether Disabling the schedule works */

      cy.get("#miq_schedule_vmdb_choice").click();
      cy.get(
        'ul[aria-label="Configuration"] [title="Disable this Schedule"]'
      ).click();
      cy.get("#main_div #flash_msg_div .alert-info").contains(
        "The selected Schedules were disabled"
      );

      /* Checking whether Enabling the schedule works */

      cy.get("#miq_schedule_vmdb_choice").click();
      cy.get(
        'ul[aria-label="Configuration"] [title="Enable this Schedule"]'
      ).click();
      cy.get("#main_div #flash_msg_div .alert-info").contains(
        "The selected Schedules were enabled"
      );

      /* Checking whether Queueing up the schedule to run now */

      cy.get("#miq_schedule_vmdb_choice").click();
      cy.get(
        'ul[aria-label="Configuration"] [title="Queue up this Schedule to run now"]'
      ).click();
      cy.get("#main_div #flash_msg_div .alert-success").contains(
        "The selected Schedule has been queued to run"
      );

      /* Checking whether Deleting the schedule works */

      cy.get("#miq_schedule_vmdb_choice").click();
      cy.on("window:confirm", (text) => {
        expect(text).to.eq(
          "Warning: This Schedule and ALL of its components will be permanently removed!"
        );
        return true;
      });
      cy.get(
        'ul[aria-label="Configuration"] [title="Delete this Schedule from the Database"]'
      ).click();
      cy.get("#main_div #flash_msg_div .alert-success").contains(
        'Schedule "Dummy name": Delete successful'
      );
    });
  });
});
