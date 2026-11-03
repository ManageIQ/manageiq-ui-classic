import { flashClassMap } from '../../../../support/assertions/assertion_constants';

const BUTTON_FACTORY_ATTRS = {
  applies_to_class: 'AvailabilityZone',
  options: { button_type: 'default', display_for: 'single', submit_how: 'one', display: true },
  uri_path: '/System/Process/Request',
  uri_attributes: { request: 'original_request' },
  uri_message: 'create',
};

const navigateToUnassignedButtons = () => {
  cy.selectAccordionItem(['Object Types', 'Availability Zone']);
  cy.selectAccordionItem(['Object Types', 'Availability Zone', '[Unassigned Buttons]']);
};

describe('Automation > Embedded Automate > Customization > Buttons', () => {
  afterEach(() => {
    cy.appDbState('restore');
  });

  it('creates a button', () => {
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.accordion('Buttons');
    navigateToUnassignedButtons();
    cy.toolbar('Configuration', 'Add a new Button');

    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type('Test Button');
    cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type('Test Button Description');

    cy.tabs({ tabLabel: 'Advanced' });
    cy.getFormInputFieldByIdAndType({ inputId: 'request' }).type('test_request');

    cy.interceptApi({
      alias: 'createButtonApi',
      urlPattern: /\/api\/custom_buttons\/?$/,
      triggerFn: () =>
        cy.getFormButtonByTypeWithText({ buttonText: 'Add', buttonType: 'submit' }).click(),
    });

    cy.expect_flash(flashClassMap.success, 'Test Button');
  });

  it('edits a button', () => {
    cy.appFactories([
      ['create', 'custom_button', { ...BUTTON_FACTORY_ATTRS, name: 'Edit Test Button', description: 'Original description' }],
    ]);
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.accordion('Buttons');
    navigateToUnassignedButtons();

    cy.get('.clickable-row').contains('Edit Test Button').should('be.visible').click();
    cy.toolbar('Configuration', 'Edit this Button');

    cy.getFormInputFieldByIdAndType({ inputId: 'name' }).clear().type('Renamed Button');

    cy.interceptApi({
      method: 'PUT',
      alias: 'editButtonApi',
      urlPattern: /\/api\/custom_buttons\/\d+$/,
      triggerFn: () =>
        cy.getFormButtonByTypeWithText({ buttonText: 'Save', buttonType: 'submit' }).click(),
    });

    cy.expect_flash(flashClassMap.success, 'Renamed Button');
  });

  it('deletes a button', () => {
    cy.appFactories([
      ['create', 'custom_button', { ...BUTTON_FACTORY_ATTRS, name: 'Delete Test Button', description: 'To be deleted' }],
    ]);
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.accordion('Buttons');
    navigateToUnassignedButtons();

    cy.get('.clickable-row').contains('Delete Test Button').should('be.visible').click();
    cy.toolbar('Configuration', 'Remove this Button');

    cy.expect_modal({ modalHeaderText: 'Delete Button', modalContentExpectedTexts: ['Delete Test Button'], targetFooterButtonText: 'Delete' });

    cy.expect_flash(flashClassMap.success, 'deleted');
  });

  it('shows the custom button for the allowed role and hides it for other roles', () => {
    const uid = Date.now();
    const ZONE_NAME = `Cypress Role Test Zone ${uid}`;
    const BUTTON_GROUP_NAME = `Custom Actions ${uid}`;
    const BUTTON_NAME = `Admin Only Button ${uid}`;
    const READER_USER = `reader_${uid}`;

    cy.appFactories([['create', 'availability_zone_amazon', { name: ZONE_NAME }]]);

    cy.appEval(`
      admin_role  = MiqUserRole.find_by!(:name => 'EvmRole-super_administrator')
      reader_role = MiqUserRole.find_by!(:name => 'EvmRole-reader')

      button = CustomButton.create!(
        :name             => ${JSON.stringify(BUTTON_NAME)},
        :description      => ${JSON.stringify(BUTTON_NAME)},
        :applies_to_class => 'AvailabilityZone',
        :options          => {:button_type => 'default', :display_for => 'single', :submit_how => 'one', :display => true},
        :visibility       => {:roles => [admin_role.id.to_s]},
        :uri_path         => '/System/Process/Request',
        :uri_attributes   => {'request' => 'original_request'},
        :uri_message      => 'create'
      )

      CustomButtonSet.create!(
        :name        => ${JSON.stringify(`${BUTTON_GROUP_NAME}|cbg-${uid}`)},
        :description => ${JSON.stringify(BUTTON_GROUP_NAME)},
        :set_data    => {:applies_to_class => 'AvailabilityZone', :button_order => [button.id], :button_icon => 'fa fa-cog', :group_index => 1}
      )

      group = MiqGroup.create!(:description => ${JSON.stringify(`Reader Group ${uid}`)}, :tenant => Tenant.root_tenant)
      Entitlement.create!(:miq_group => group, :miq_user_role => reader_role)
      FactoryBot.create(
        :user,
        :userid           => ${JSON.stringify(READER_USER)},
        :name             => ${JSON.stringify(`Reader User ${uid}`)},
        :miq_group_ids    => [group.id],
        :current_group_id => group.id
      )
      nil
    `);

    // Admin user (EvmRole-super_administrator) sees the button group in the toolbar
    cy.login();
    cy.menu('Compute', 'Clouds', 'Availability Zones');
    cy.get('.clickable-row').contains(ZONE_NAME).click();
    cy.toolbar(BUTTON_GROUP_NAME, BUTTON_NAME);

    // Reader user (EvmRole-reader) does not see the button group.
    cy.menu('Logout');
    cy.login(READER_USER, 'dummy');
    cy.menu('Compute', 'Clouds', 'Availability Zones');
    cy.get('.clickable-row').contains(ZONE_NAME).click();
    cy.get('#toolbar button').should(($buttons) => {
      const labels = [...$buttons].map((btn) => btn.innerText.trim());
      // Wait for the toolbar to render so the negative checks below are not vacuously true
      expect(labels, 'rendered toolbar buttons').to.include('Monitoring');
      expect(labels).to.not.include(BUTTON_GROUP_NAME);
      expect(labels).to.not.include(BUTTON_NAME);
    });
  });
});
