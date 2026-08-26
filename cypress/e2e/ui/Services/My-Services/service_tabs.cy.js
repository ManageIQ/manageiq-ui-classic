// Menu options
const SERVICES_MENU    = 'Services';
const MY_SERVICES_MENU = 'My Services';

// Tab label text (matches SERVICE labelConfig in helper.js)
const TAB_DETAILS      = 'Details';
const TAB_PROVISIONING = 'Provisioning';
const TAB_RETIREMENT   = 'Retirement';
const TAB_JOB          = 'Job';

// DOM selectors emitted by _svcs_show.html.haml
const TABS_WRAPPER  = '#services-tabs-wrapper';
const TABS_PANEL    = '.miq_custom_tabs';
const DETAILS_PANEL = '#details';

function visitMyServices() {
  cy.menu(SERVICES_MENU, MY_SERVICES_MENU);
}

function clickServiceRow(name) {
  cy.clickTableRowByText({ text: name, columnIndex: 1 });
}

// Generic Service — only Details tab
describe('My Services — Generic Service Tabs', () => {
  const SERVICE_NAME = 'cy-generic-service';

  beforeEach(() => {
    cy.appFactories([
      ['create', 'service', { name: SERVICE_NAME, display: true }],
    ]);
    cy.login();
    visitMyServices();
    clickServiceRow(SERVICE_NAME);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('renders tabs wrapper and Details panel by default', () => {
    cy.get(TABS_WRAPPER).should('be.visible');
    cy.get(TABS_PANEL).should('be.visible');

    cy.contains('button', TAB_DETAILS).should('be.visible');
    cy.get(DETAILS_PANEL).should('be.visible');
  });

  it('Details panel stays active after explicitly clicking the Details tab', () => {
    cy.tabs({ tabLabel: TAB_DETAILS });
    cy.get(DETAILS_PANEL).should('be.visible');
  });
});

// ServiceAnsiblePlaybook — Details + Provisioning + Retirement tabs
describe('My Services — Ansible Playbook Service Tabs', () => {
  const SERVICE_NAME = 'cy-ansible-playbook-service';

  beforeEach(() => {
    // 1. Create the service
    cy.appFactories([
      ['create', 'service_ansible_playbook', { name: SERVICE_NAME, display: true }],
    ]).then(([service]) => {
      // 2. Create EmbeddedAnsible jobs and link them directly via ServiceResource
      cy.appEval(`
        service = Service.find(${service.id})
        provision_job  = ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Job.create!(
          :name        => 'cy-provision-job',
          :ems_ref     => 'cy-provision-job-ref',
          :status      => 'create_complete',
          :start_time  => Time.now.utc,
          :finish_time => Time.now.utc,
          :verbosity   => 0,
          :hosts       => []
        )
        retirement_job = ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Job.create!(
          :name        => 'cy-retirement-job',
          :ems_ref     => 'cy-retirement-job-ref',
          :status      => 'create_complete',
          :start_time  => Time.now.utc,
          :finish_time => Time.now.utc,
          :verbosity   => 0,
          :hosts       => []
        )
        service.service_resources.create!(
          :resource_type => 'OrchestrationStack',
          :resource_id   => provision_job.id,
          :name          => 'Provision'
        )
        service.service_resources.create!(
          :resource_type => 'OrchestrationStack',
          :resource_id   => retirement_job.id,
          :name          => 'Retirement'
        )
      `);
    });
    cy.login();
    visitMyServices();
    clickServiceRow(SERVICE_NAME);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('renders Details, Provisioning, and Retirement tabs with correct panels', () => {
    cy.get(TABS_WRAPPER).should('be.visible');
    cy.get(TABS_PANEL).should('be.visible');

    cy.contains('button', TAB_DETAILS).should('be.visible');
    cy.get(DETAILS_PANEL).should('be.visible');

    cy.contains('button', TAB_PROVISIONING).should('be.visible');
    cy.tabs({ tabLabel: TAB_PROVISIONING });
    cy.get('#provisioning').should('be.visible');
    cy.get(DETAILS_PANEL).should('not.have.class', 'active');

    cy.contains('button', TAB_RETIREMENT).should('be.visible');
    cy.tabs({ tabLabel: TAB_RETIREMENT });
    cy.get('#retirement').should('be.visible');
  });

  it('resets to Details tab when navigating away and back', () => {
    cy.tabs({ tabLabel: TAB_PROVISIONING });
    cy.get('#provisioning').should('be.visible');
    visitMyServices();
    clickServiceRow(SERVICE_NAME);

    // Details panel should be active again (fresh page load resets state)
    cy.get(TABS_WRAPPER).should('be.visible');
    cy.get(DETAILS_PANEL).should('be.visible');
  });
});

// ServiceEmbeddedTerraform — Details + Output tabs
describe('My Services — Embedded Terraform Service Tabs', () => {
  const SERVICE_NAME = 'cy-terraform-service';

  beforeEach(() => {
    cy.appFactories([
      ['create', 'service_embedded_terraform', { name: SERVICE_NAME, display: true }],
    ]).then(([service]) => {
      cy.appEval(`
        service = Service.find(${service.id})
        stack   = FactoryBot.create(:terraform_stack)
        service.add_resource!(stack, :name => 'Provision')
      `);
    });
    cy.login();
    visitMyServices();
    clickServiceRow(SERVICE_NAME);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('renders Details and Output tabs with correct panels', () => {
    cy.get(TABS_WRAPPER).should('be.visible');
    cy.get(TABS_PANEL).should('be.visible');

    // Details tab — active by default
    cy.contains('button', 'Details').should('be.visible');
    cy.get(DETAILS_PANEL).should('be.visible');

    // Output tab
    cy.contains('button', 'Output').should('be.visible');
    cy.tabs({ tabLabel: 'Output' });
    cy.get('#output').should('be.visible');
    cy.get(DETAILS_PANEL).should('not.have.class', 'active');
  });

  it('resets to Details tab when navigating away and back', () => {
    cy.tabs({ tabLabel: 'Output' });
    cy.get('#output').should('be.visible');

    visitMyServices();
    clickServiceRow(SERVICE_NAME);

    cy.get(TABS_WRAPPER).should('be.visible');
    cy.get(DETAILS_PANEL).should('be.visible');
  });
});

// ServiceAnsibleTower — Details + Job tabs
describe('My Services — Ansible Tower Service Tabs', () => {
  const SERVICE_NAME = 'cy-ansible-tower-service';

  beforeEach(() => {
    cy.appFactories([
      ['create', 'service_ansible_tower', { name: SERVICE_NAME, display: true }],
    ]).then(([service]) => {
      // Create the AnsibleTower job and link it via ServiceResource with explicit
      cy.appEval(`
        service = Service.find(${service.id})
        job = ManageIQ::Providers::AnsibleTower::AutomationManager::Job.create!(
          :name        => 'cy-tower-job',
          :ems_ref     => 'cy-tower-job-ref',
          :status      => 'create_complete',
          :start_time  => Time.now.utc,
          :finish_time => Time.now.utc,
          :verbosity   => 0
        )
        service.service_resources.create!(
          :resource_type => 'OrchestrationStack',
          :resource_id   => job.id
        )
      `);
    });
    cy.login();
    visitMyServices();
    clickServiceRow(SERVICE_NAME);
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  it('renders Details and Job tabs with correct panels', () => {
    cy.get(TABS_WRAPPER).should('be.visible');
    cy.get(TABS_PANEL).should('be.visible');

    cy.contains('button', TAB_DETAILS).should('be.visible');
    cy.get(DETAILS_PANEL).should('be.visible');

    cy.contains('button', TAB_JOB).should('be.visible');
    cy.tabs({ tabLabel: TAB_JOB });
    cy.get('#tower_job').should('be.visible');
    cy.get(DETAILS_PANEL).should('not.have.class', 'active');
  });

  it('resets to Details tab when navigating away and back', () => {
    cy.tabs({ tabLabel: TAB_JOB });
    cy.get('#tower_job').should('be.visible');
    visitMyServices();
    clickServiceRow(SERVICE_NAME);

    // Details panel should be active again
    cy.get(TABS_WRAPPER).should('be.visible');
    cy.get(DETAILS_PANEL).should('be.visible');
  });
});
