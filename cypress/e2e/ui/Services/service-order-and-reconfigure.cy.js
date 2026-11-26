// / <reference types="cypress" />
// service-order-and-reconfigure.cy.js
// Integration tests for the Order Service Form and Service Reconfigure React components.

const SERVICES_MENU = 'Services';
const CATALOGS_MENU = 'Catalogs';
const MY_SERVICES_MENU = 'My Services';
const SERVICE_CATALOGS_ACCORDION = 'Service Catalogs';
const CATALOG_NAME = 'cy-order-catalog';
const TEMPLATE_NAME = 'cy-order-svc';
const RECONFIG_SERVICE_NAME = 'cy-reconfig-service';

// Order Service Form

describe('Order Service Form', () => {
  let templateId;
  let dialogId;

  beforeEach(() => {
    cy.appEval(`
      Dialog.where(:label => 'cy-order-dialog').each { |d| d.dialog_tabs.destroy_all; d.delete }
      ServiceTemplateCatalog.where(:name => 'cy-order-catalog').destroy_all
      ServiceTemplate.where(:name => 'cy-order-svc').destroy_all
      nil
    `);

    cy.appEval(`
      d = Dialog.new(:label => 'cy-order-dialog')
      d.define_singleton_method(:validate_children) { true }
      d.save!
      tab = d.dialog_tabs.build(:label => 'Tab One', :position => 0)
      tab.define_singleton_method(:validate_children) { true }
      tab.save!
      group = tab.dialog_groups.build(:label => 'General', :position => 0)
      group.define_singleton_method(:validate_children) { true }
      group.save!
      group.dialog_fields.create!(
        :name => 'vm_name', :label => 'VM Name',
        :type => 'DialogFieldTextBox', :required => true,
        :default_value => '', :position => 0, :display => 'edit'
      )
      d.id
    `).then((dId) => {
      dialogId = dId;
      cy.appFactories([
        ['create', 'service_template_catalog', { name: CATALOG_NAME }],
      ]).then(([catalog]) => {
        cy.appFactories([
          ['create', 'service_template', {
            name: TEMPLATE_NAME,
            generic_subtype: 'custom',
            prov_type: 'generic',
            display: true,
            service_template_catalog_id: catalog.id,
          }],
        ]).then(([template]) => {
          templateId = template.id;
          cy.appFactories([
            ['create', 'resource_action', {
              action: 'Provision',
              resource_type: 'ServiceTemplate',
              resource_id: template.id,
              dialog_id: dId,
            }],
          ]);
        });
      });
    });

    cy.login();
    cy.menu(SERVICES_MENU, CATALOGS_MENU);
    cy.accordion(SERVICE_CATALOGS_ACCORDION);
    cy.selectAccordionItem([CATALOG_NAME]);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  function openOrderForm() {
    cy.clickTableRowByText({ text: TEMPLATE_NAME, columnIndex: 0 });
    cy.intercept('GET', `/api/service_dialogs/${dialogId}*`).as('fetchDialog');
    cy.contains('button', 'Order').click();
    cy.wait('@fetchDialog');
    cy.get('.service-container.orderServiceForm').should('be.visible');
  }

  it('renders the Carbon form with tabs, section labels, and field labels', () => {
    openOrderForm();

    cy.get('.cds--tabs').should('be.visible');
    cy.contains('.section-label', 'General').should('be.visible');
    cy.contains('.field-label', 'VM Name').should('be.visible');
    cy.contains('button', 'Submit').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('keeps Submit disabled while required VM Name is empty', () => {
    openOrderForm();
    cy.contains('button', 'Submit').should('be.disabled');
  });

  it('enables Submit after filling VM Name and POSTs the correct payload', () => {
    cy.intercept('POST', `/api/service_catalogs/*/service_templates/${templateId}`, (req) => {
      req.reply({ statusCode: 200, body: { success: true } });
    }).as('submitOrder');

    openOrderForm();

    cy.get('.service-container input[type="text"]').first().clear().type('my-new-vm');
    cy.contains('button', 'Submit').should('not.be.disabled').click();

    cy.wait('@submitOrder').then((interception) => {
      // miqFetch omits Content-Type so Cypress may deliver the body as a raw string
      const body = typeof interception.request.body === 'string'
        ? JSON.parse(interception.request.body)
        : interception.request.body;
      expect(body).to.have.property('action', 'order');
      expect(body).to.have.property('vm_name', 'my-new-vm');
    });
  });

  it('navigates away without POSTing when Cancel is clicked', () => {
    cy.intercept('POST', `/api/service_catalogs/*/service_templates/${templateId}`).as('neverCalled');

    openOrderForm();

    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 8000 }).should('include', '/catalog/explorer');
    cy.get('@neverCalled.all').should('have.length', 0);
  });
});

// Order Service Form with every dialog field type, spread across tabs and sections

describe('Order Service Form with all dialog field types', () => {
  const FULL_CATALOG_NAME = 'cy-full-catalog';
  const FULL_TEMPLATE_NAME = 'cy-full-svc';
  let ids;

  const parseBody = (interception) => (typeof interception.request.body === 'string'
    ? JSON.parse(interception.request.body)
    : interception.request.body);

  const fieldRow = (name) => cy.get(`#section-field-row-${name}`);

  const chooseOption = (name, optionText, dropdownIndex = 0) => {
    fieldRow(name).find('button.cds--list-box__field').eq(dropdownIndex).click();
    fieldRow(name).contains('.cds--list-box__menu-item', new RegExp(`^\\s*${optionText}\\s*$`)).click();
  };

  const chooseMultipleOptions = (name, optionTexts, closeByClickingOn) => {
    fieldRow(name).find('button[aria-label="Open"]').click();
    optionTexts.forEach((optionText) => {
      fieldRow(name).contains('.cds--list-box__menu-item', optionText).click();
    });
    cy.contains('.section-label', closeByClickingOn).click();
  };

  const openFullOrderForm = () => {
    cy.clickTableRowByText({ text: FULL_TEMPLATE_NAME, columnIndex: 0 });
    cy.intercept('GET', `/api/service_dialogs/${ids.dialogId}*`).as('fetchFullDialog');
    cy.contains('button', 'Order').click();
    cy.wait('@fetchFullDialog');
    cy.get('.service-container.orderServiceForm').should('be.visible');
  };

  const fillRequiredFields = () => {
    cy.tabs({ tabLabel: 'Basic' });
    fieldRow('vm_name').find('input').clear().type('cy-vm-01');
    fieldRow('code').find('input').clear().type('ABC');
    cy.tabs({ tabLabel: 'Selection' });
    chooseOption('region', 'US');
  };

  beforeEach(() => {
    cy.appEval(`
      Dialog.where(:label => 'cy-full-dialog').each { |d| d.dialog_tabs.destroy_all; d.delete }
      ServiceTemplateCatalog.where(:name => 'cy-full-catalog').destroy_all
      ServiceTemplate.where(:name => 'cy-full-svc').destroy_all
      if (old = Classification.lookup_by_name('cy_full_cat'))
        old.entries.each(&:destroy)
        old.destroy
      end
      nil
    `);

    cy.appEval(`
      cat = Classification.create_category!(
        :name => 'cy_full_cat', :description => 'Cy Full Category',
        :single_value => false, :show => true, :read_only => false
      )
      tags = %w[alpha beta gamma].map { |n| cat.add_entry(:name => n, :description => "#{n.capitalize} Tag") }

      d = Dialog.new(:label => 'cy-full-dialog')
      d.define_singleton_method(:validate_children) { true }
      d.save!

      add_tab = lambda do |label, position|
        tab = d.dialog_tabs.build(:label => label, :position => position)
        tab.define_singleton_method(:validate_children) { true }
        tab.save!
        tab
      end
      add_group = lambda do |tab, label, position, description = nil|
        group = tab.dialog_groups.build(:label => label, :description => description, :position => position)
        group.define_singleton_method(:validate_children) { true }
        group.save!
        group
      end
      position = -1
      add_field = lambda do |group, attrs|
        position += 1
        group.dialog_fields.create!({:position => position, :display => 'edit', :required => false, :default_value => ''}.merge(attrs))
      end
      list_options = {:sort_by => :none, :sort_order => :ascending, :data_type => 'string'}
      tag_options = {:category_id => cat.id, :category_name => cat.name, :category_description => cat.description}

      basic = add_tab.call('Basic', 0)
      text_group = add_group.call(basic, 'Text inputs', 0, 'Free form text entry')
      add_field.call(text_group, :name => 'vm_name', :label => 'VM Name', :type => 'DialogFieldTextBox', :required => true, :description => 'Name of the new VM')
      add_field.call(text_group, :name => 'owner', :label => 'Owner', :type => 'DialogFieldTextBox', :default_value => 'admin')
      add_field.call(text_group, :name => 'cpu_count', :label => 'CPU Count', :type => 'DialogFieldTextBox', :default_value => '2', :data_type => 'integer')
      add_field.call(text_group, :name => 'password_field', :label => 'Password', :type => 'DialogFieldTextBox', :options => {:protected => true})
      add_field.call(text_group, :name => 'code', :label => 'Code', :type => 'DialogFieldTextBox', :required => true, :validator_type => 'regex', :validator_rule => '^[A-Z]{3}$', :validator_message => 'Code must be three capital letters')
      add_field.call(text_group, :name => 'notes', :label => 'Notes', :type => 'DialogFieldTextAreaBox', :default_value => 'first note')
      choice_group = add_group.call(basic, 'Choices', 1)
      add_field.call(choice_group, :name => 'backup', :label => 'Enable backup', :type => 'DialogFieldCheckBox', :default_value => 't')
      add_field.call(choice_group, :name => 'monitoring', :label => 'Enable monitoring', :type => 'DialogFieldCheckBox', :default_value => 'f')
      add_field.call(choice_group, :name => 'size', :label => 'Size', :type => 'DialogFieldRadioButton', :default_value => 'm', :values => [%w[s Small], %w[m Medium], %w[l Large]], :options => list_options)

      selection = add_tab.call('Selection', 1)
      dropdown_group = add_group.call(selection, 'Dropdowns', 0)
      add_field.call(dropdown_group, :name => 'region', :label => 'Region', :type => 'DialogFieldDropDownList', :required => true, :values => [%w[us US], %w[eu EU], %w[ap AP]], :options => list_options.merge(:force_multi_value => false))
      add_field.call(dropdown_group, :name => 'flavor', :label => 'Flavor', :type => 'DialogFieldDropDownList', :default_value => 'm1', :values => [%w[s1 Small], %w[m1 Medium], %w[l1 Large]], :options => list_options.merge(:force_multi_value => false))
      add_field.call(dropdown_group, :name => 'networks', :label => 'Networks', :type => 'DialogFieldDropDownList', :default_value => '["n1"]', :values => [%w[n1 Public], %w[n2 Private], %w[n3 Management]], :options => list_options.merge(:force_multi_value => true))
      tag_group = add_group.call(selection, 'Tags', 1)
      add_field.call(tag_group, :name => 'env_tag', :label => 'Environment tag', :type => 'DialogFieldTagControl', :options => tag_options.merge(:force_single_value => true))
      add_field.call(tag_group, :name => 'multi_tags', :label => 'Additional tags', :type => 'DialogFieldTagControl', :options => tag_options.merge(:force_single_value => false))

      schedule = add_tab.call('Schedule', 2)
      date_group = add_group.call(schedule, 'Dates', 0)
      add_field.call(date_group, :name => 'start_date', :label => 'Start date', :type => 'DialogFieldDateControl', :default_value => '2026-01-31')
      add_field.call(date_group, :name => 'start_time', :label => 'Start date and time', :type => 'DialogFieldDateTimeControl')

      catalog = ServiceTemplateCatalog.create!(:name => 'cy-full-catalog')
      template = ServiceTemplate.create!(
        :name => 'cy-full-svc', :generic_subtype => 'custom', :prov_type => 'generic',
        :display => true, :service_template_catalog => catalog
      )
      template.resource_actions.create!(:action => 'Provision', :dialog => d)

      {
        :dialogId   => d.id,
        :templateId => template.id,
        :catalogId  => catalog.id,
        :tagAlpha   => tags[0].id.to_s,
        :tagBeta    => tags[1].id.to_s,
        :tagGamma   => tags[2].id.to_s
      }
    `).then((result) => {
      ids = result;
    });

    cy.login();
    cy.menu(SERVICES_MENU, CATALOGS_MENU);
    cy.accordion(SERVICE_CATALOGS_ACCORDION);
    cy.selectAccordionItem([FULL_CATALOG_NAME]);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('renders every dialog tab, section and field label', () => {
    openFullOrderForm();

    cy.get('.service-container [role="tab"]').then(($tabs) => {
      expect([...$tabs].map((tab) => tab.textContent.trim())).to.deep.equal(['Basic', 'Selection', 'Schedule']);
    });

    cy.contains('.section-label', 'Text inputs').should('be.visible');
    cy.contains('.section-label', 'Choices').should('be.visible');
    ['VM Name', 'Owner', 'CPU Count', 'Password', 'Code', 'Notes', 'Enable backup', 'Enable monitoring', 'Size']
      .forEach((label) => cy.contains('.field-label', label).should('be.visible'));
    cy.contains('.field-label', 'VM Name').find('.field-required').should('exist');
    cy.contains('.field-label', 'Owner').find('.field-required').should('not.exist');
    cy.contains('.field-label', 'VM Name').find('.field-description-tooltip').should('exist');
    cy.contains('.section-label', 'Dropdowns').should('not.be.visible');

    cy.tabs({ tabLabel: 'Selection' });
    cy.contains('.section-label', 'Text inputs').should('not.be.visible');
    cy.contains('.section-label', 'Dropdowns').should('be.visible');
    cy.contains('.section-label', 'Tags').should('be.visible');
    ['Region', 'Flavor', 'Networks', 'Environment tag', 'Additional tags']
      .forEach((label) => cy.contains('.field-label', label).should('be.visible'));

    cy.tabs({ tabLabel: 'Schedule' });
    cy.contains('.section-label', 'Dates').should('be.visible');
    ['Start date', 'Start date and time']
      .forEach((label) => cy.contains('.field-label', label).should('be.visible'));
  });

  it('shows the dialog default values in each field type', () => {
    openFullOrderForm();

    fieldRow('vm_name').find('input').should('have.value', '');
    fieldRow('owner').find('input').should('have.value', 'admin');
    fieldRow('cpu_count').find('input').should('have.attr', 'type', 'number').and('have.value', '2');
    fieldRow('password_field').find('input').should('have.attr', 'type', 'password');
    fieldRow('notes').find('textarea').should('have.value', 'first note');
    fieldRow('backup').find('input[type="checkbox"]').should('be.checked');
    fieldRow('monitoring').find('input[type="checkbox"]').should('not.be.checked');
    fieldRow('size').find('input[value="m"]').should('be.checked');
    fieldRow('size').find('input[value="s"]').should('not.be.checked');

    cy.tabs({ tabLabel: 'Selection' });
    fieldRow('region').should('contain', 'Nothing selected');
    fieldRow('flavor').should('contain', 'Medium');
    fieldRow('networks').find('.cds--tag').should('contain', '1');
    fieldRow('env_tag').should('contain', 'Nothing selected');
    fieldRow('multi_tags').find('.cds--tag').should('not.exist');

    cy.tabs({ tabLabel: 'Schedule' });
    fieldRow('start_date').find('input').should('have.value', '01/31/2026');
  });

  it('keeps Submit disabled until every required field on every tab is valid', () => {
    openFullOrderForm();
    cy.contains('button', 'Submit').should('be.disabled');

    fieldRow('vm_name').find('input').type('cy-vm-01');
    fieldRow('code').find('input').type('abc');
    fieldRow('code').should('contain', 'Code must be three capital letters');
    cy.contains('button', 'Submit').should('be.disabled');

    fieldRow('code').find('input').clear().type('ABC');
    fieldRow('code').should('not.contain', 'Code must be three capital letters');
    cy.contains('button', 'Submit').should('be.disabled');

    cy.tabs({ tabLabel: 'Selection' });
    chooseOption('region', 'EU');
    cy.contains('button', 'Submit').should('not.be.disabled');
  });

  it('POSTs the default values of every field type when only the required fields are filled', () => {
    cy.intercept('POST', `/api/service_catalogs/${ids.catalogId}/service_templates/${ids.templateId}`, {
      statusCode: 200,
      body: { success: true },
    }).as('submitOrder');

    openFullOrderForm();
    fillRequiredFields();
    cy.contains('button', 'Submit').should('not.be.disabled').click();

    cy.wait('@submitOrder').then((interception) => {
      const body = parseBody(interception);
      expect(body).to.include({
        action: 'order',
        vm_name: 'cy-vm-01',
        owner: 'admin',
        cpu_count: '2',
        password_field: '',
        code: 'ABC',
        notes: 'first note',
        backup: 't',
        monitoring: 'f',
        size: 'm',
        region: 'us',
        flavor: 'm1',
        env_tag: '',
        start_date: '2026-01-31',
      });
      expect(body.networks).to.deep.equal(['n1']);
      expect(body.multi_tags).to.deep.equal([]);
      expect(body.start_time).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  it('POSTs the edited value of every field type across all tabs', () => {
    cy.intercept('POST', `/api/service_catalogs/${ids.catalogId}/service_templates/${ids.templateId}`, {
      statusCode: 200,
      body: { success: true },
    }).as('submitOrder');

    openFullOrderForm();

    cy.tabs({ tabLabel: 'Basic' });
    fieldRow('vm_name').find('input').type('cy-vm-02');
    fieldRow('owner').find('input').clear().type('cy-owner');
    fieldRow('cpu_count').find('input').clear().type('8');
    fieldRow('password_field').find('input').type('s3cret');
    fieldRow('code').find('input').type('XYZ');
    fieldRow('notes').find('textarea').clear().type('edited notes');
    fieldRow('backup').find('input[type="checkbox"]').uncheck({ force: true });
    fieldRow('monitoring').find('input[type="checkbox"]').check({ force: true });
    fieldRow('size').find('input[value="l"]').check({ force: true });

    cy.tabs({ tabLabel: 'Selection' });
    chooseOption('region', 'EU');
    chooseOption('flavor', 'Large');
    chooseMultipleOptions('networks', ['Private', 'Management'], 'Dropdowns');
    chooseOption('env_tag', 'Beta Tag');
    chooseMultipleOptions('multi_tags', ['Alpha Tag', 'Gamma Tag'], 'Tags');

    cy.tabs({ tabLabel: 'Schedule' });
    fieldRow('start_date').find('input').clear().type('03/15/2027{enter}');
    chooseOption('start_time', '03', 0);
    chooseOption('start_time', '30', 1);
    chooseOption('start_time', 'PM', 2);

    cy.contains('button', 'Submit').should('not.be.disabled').click();

    cy.wait('@submitOrder').then((interception) => {
      const body = parseBody(interception);
      expect(body).to.include({
        action: 'order',
        vm_name: 'cy-vm-02',
        owner: 'cy-owner',
        cpu_count: '8',
        password_field: 's3cret',
        code: 'XYZ',
        notes: 'edited notes',
        backup: 'f',
        monitoring: 't',
        size: 'l',
        region: 'eu',
        flavor: 'l1',
        env_tag: ids.tagBeta,
        start_date: '2027-03-15',
      });
      expect(body.networks).to.have.members(['n1', 'n2', 'n3']);
      expect(body.multi_tags).to.have.members([ids.tagAlpha, ids.tagGamma]);

      // The picked wall-clock time is sent as-is with a Z suffix, independent of the browser timezone.
      // The date part defaults to today, so only the time part is compared.
      expect(body.start_time).to.match(/T15:30:00\.000Z$/);
    });
  });

  it('keeps the values entered on one tab when switching to another tab and back', () => {
    openFullOrderForm();

    fieldRow('vm_name').find('input').type('cy-vm-03');
    fieldRow('size').find('input[value="s"]').check({ force: true });
    cy.tabs({ tabLabel: 'Selection' });
    chooseOption('region', 'AP');
    cy.tabs({ tabLabel: 'Basic' });

    fieldRow('vm_name').find('input').should('have.value', 'cy-vm-03');
    fieldRow('size').find('input[value="s"]').should('be.checked');
    cy.tabs({ tabLabel: 'Selection' });
    fieldRow('region').should('contain', 'AP');
  });
});

// Service Reconfigure Form

describe('Service Reconfigure Form', () => {
  let serviceId;

  beforeEach(() => {
    cy.appEval(`
      Dialog.where(:label => 'cy-reconfig-dialog').each { |d| d.dialog_tabs.destroy_all; d.delete }
      Service.where(:name => 'cy-reconfig-service').destroy_all
      ServiceTemplate.where(:name => 'cy-reconfig-template').destroy_all
      nil
    `);

    cy.appEval(`
      d = Dialog.new(:label => 'cy-reconfig-dialog')
      d.define_singleton_method(:validate_children) { true }
      d.save!
      tab = d.dialog_tabs.build(:label => 'Tab', :position => 0)
      tab.define_singleton_method(:validate_children) { true }
      tab.save!
      group = tab.dialog_groups.build(:label => 'Options', :position => 0)
      group.define_singleton_method(:validate_children) { true }
      group.save!
      group.dialog_fields.create!(
        :name => 'notes', :label => 'Notes',
        :type => 'DialogFieldTextBox', :required => false,
        :default_value => '', :position => 0, :display => 'edit'
      )
      d.id
    `).then((dId) => {
      cy.appFactories([
        ['create', 'service_template', {
          name: 'cy-reconfig-template',
          generic_subtype: 'custom',
          prov_type: 'generic',
          display: true,
        }],
      ]).then(([template]) => {
        cy.appFactories([
          ['create', 'resource_action', {
            action: 'Reconfigure',
            resource_type: 'ServiceTemplate',
            resource_id: template.id,
            dialog_id: dId,
            fqname: '/System/Process/ServiceReconfigure',
          }],
        ]).then(() => {
          // Service created via appEval: cy.appFactories serialises options through JSON
          // (string keys), but Service#reconfigure_dialog reads options[:dialog] with a
          // symbol key — use Ruby directly to ensure the correct key type.
          cy.appEval(`
            svc = Service.create!(
              :name                => 'cy-reconfig-service',
              :service_template_id => ${template.id},
              :display             => true,
              :lifecycle_state     => 'provisioned',
              :options             => { :dialog => {} }
            )
            svc.id
          `).then((svcId) => {
            serviceId = svcId;
          });
        });
      });
    });

    cy.login();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  function openReconfigureForm() {
    cy.menu(SERVICES_MENU, MY_SERVICES_MENU);
    // Use the search button: pressing Enter submits the form natively and also fires a second search-less POST, which races.
    cy.get('#search_text').clear().type(RECONFIG_SERVICE_NAME);
    cy.get('.search_button').click();
    cy.contains('.miq-data-table table tbody tr td:nth-child(2)', RECONFIG_SERVICE_NAME, { timeout: 15000 }).should('be.visible');
    cy.clickTableRowByText({ text: RECONFIG_SERVICE_NAME, columnIndex: 1 });
    cy.toolbar('Configuration', 'Reconfigure this Service');
    cy.url({ timeout: 10000 }).should('include', '/service/service_reconfigure/');
    cy.get('.service-container.serviceReconfigure').should('be.visible');
  }

  it('renders the reconfigure form with Carbon tabs, section label, and field label', () => {
    openReconfigureForm();

    cy.get('.cds--tabs').should('be.visible');
    cy.contains('.section-label', 'Options').should('be.visible');
    cy.contains('.field-label', 'Notes').should('be.visible');
    cy.contains('button', 'Submit').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('POSTs action:reconfigure with a resource body and redirects on submit', () => {
    cy.then(() => {
      cy.intercept('POST', `/api/services/${serviceId}`, (req) => {
        req.reply({ statusCode: 200, body: { success: true } });
      }).as('submitReconfig');
    });

    openReconfigureForm();

    cy.contains('button', 'Submit').should('not.be.disabled').click();

    cy.wait('@submitReconfig').then((interception) => {
      // miqFetch omits Content-Type so Cypress may deliver the body as a raw string
      const body = typeof interception.request.body === 'string'
        ? JSON.parse(interception.request.body)
        : interception.request.body;
      expect(body).to.have.property('action', 'reconfigure');
      expect(body).to.have.property('resource');
    });

    cy.url({ timeout: 10000 }).should('not.include', 'service_reconfigure');
  });

  it('navigates to the service list without POSTing when Cancel is clicked', () => {
    cy.then(() => {
      cy.intercept('POST', `/api/services/${serviceId}`).as('neverCalled');
    });

    openReconfigureForm();

    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 8000 }).should('not.include', 'service_reconfigure');
    cy.get('@neverCalled.all').should('have.length', 0);
  });
});
