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
    cy.get('#search_text').clear().type(`${RECONFIG_SERVICE_NAME}{enter}`);
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

    cy.url({ timeout: 10000 }).should('include', '/miq_request/show_list');
  });

  it('navigates to the service list without POSTing when Cancel is clicked', () => {
    cy.then(() => {
      cy.intercept('POST', `/api/services/${serviceId}`).as('neverCalled');
    });

    openReconfigureForm();

    cy.contains('button', 'Cancel').click();
    cy.url({ timeout: 8000 }).should('include', '/service/show_list');
    cy.get('@neverCalled.all').should('have.length', 0);
  });
});
