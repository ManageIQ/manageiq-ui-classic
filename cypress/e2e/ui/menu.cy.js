/* eslint-disable no-undef */

describe('Menu', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Menu contains all menu items', () => {
    cy.menuItems()
      .then((menu) => {
        cy.log(menu);

        expect(menu.length === 9).to.equal(true);
      });
  });

  describe('all menu items lead to non-error screens', () => {
    it('Overview >', () => {
      cy.menu('Overview', 'Dashboard').get('#main-menu');
      cy.menu('Overview', 'Reports').expect_show_list_title('All Saved Reports');
      cy.menu('Overview', 'Utilization').expect_explorer_title('Enterprise');
      cy.menu('Overview', 'Chargeback', 'Reports').expect_show_list_title('Chargeback Saved Reports');
      cy.menu('Overview', 'Chargeback', 'Rates').expect_show_list_title('Chargeback Rates');
      cy.menu('Overview', 'Chargeback', 'Assignments').expect_show_list_title('Chargeback Assignments');
      cy.menu('Overview', 'Optimization').expect_show_list_title('Optimization');
    });

    it('Services >', () => {
      cy.menu('Services', 'My Services').expect_show_list_title('Services');
      cy.menu('Services', 'Catalogs').expect_explorer_title('All Services');
      cy.menu('Services', 'Workloads').expect_explorer_title('All VMs & Instances');
      cy.menu('Services', 'Requests').expect_show_list_title('Requests');
    });

    describe('Compute >', () => {
      it('Clouds > ', () => {
        cy.menu('Compute', 'Clouds', 'Providers').expect_show_list_title('Cloud Providers');
        cy.menu('Compute', 'Clouds', 'Availability Zones').expect_show_list_title('Availability Zones');
        cy.menu('Compute', 'Clouds', 'Host Aggregates').expect_show_list_title('Host Aggregates');
        cy.menu('Compute', 'Clouds', 'Tenants').expect_show_list_title('Cloud Tenants');
        cy.menu('Compute', 'Clouds', 'Flavors').expect_show_list_title('Flavors');
        cy.menu('Compute', 'Clouds', 'Instances').expect_explorer_title('All Instances by Provider');
        cy.menu('Compute', 'Clouds', 'Stacks').expect_show_list_title('Orchestration Stacks');
        cy.menu('Compute', 'Clouds', 'Key Pairs').expect_show_list_title('Key Pairs');
        cy.menu('Compute', 'Clouds', 'Placement Groups').expect_show_list_title('Placement Groups');
        cy.menu('Compute', 'Clouds', 'Databases').expect_show_list_title('Cloud Databases');
      });

      it('Infrastructure > ', () => {
        cy.menu('Compute', 'Infrastructure', 'Providers').expect_show_list_title('Infrastructure Providers');
        cy.menu('Compute', 'Infrastructure', 'Clusters').expect_show_list_title('Clusters');
        cy.menu('Compute', 'Infrastructure', 'Hosts').expect_show_list_title('Hosts');
        cy.menu('Compute', 'Infrastructure', 'Virtual Machines').expect_explorer_title('All VMs & Templates');
        cy.menu('Compute', 'Infrastructure', 'Resource Pools').expect_show_list_title('Resource Pools');
        cy.menu('Compute', 'Infrastructure', 'Datastores').expect_explorer_title('All Datastores');
        cy.menu('Compute', 'Infrastructure', 'PXE').expect_explorer_title('All PXE Servers');
        cy.menu('Compute', 'Infrastructure', 'Networking').expect_explorer_title('All Switches');
      });

      it('Physical Infrastructure > ', () => {
        cy.menu('Compute', 'Physical Infrastructure', 'Overview').get('.card-pf-aggregate-status-title');
        cy.menu('Compute', 'Physical Infrastructure', 'Providers').expect_show_list_title('Physical Infrastructure Providers');
        cy.menu('Compute', 'Physical Infrastructure', 'Chassis').expect_show_list_title('Physical Chassis');
        cy.menu('Compute', 'Physical Infrastructure', 'Racks').expect_show_list_title('Physical Racks');
        cy.menu('Compute', 'Physical Infrastructure', 'Servers').expect_show_list_title('Physical Servers');
        cy.menu('Compute', 'Physical Infrastructure', 'Storages').expect_show_list_title('Physical Storages');
        cy.menu('Compute', 'Physical Infrastructure', 'Switches').expect_show_list_title('Physical Switches');
        cy.menu('Compute', 'Physical Infrastructure', 'Firmware Registry').expect_show_list_title('Firmware Registries');
      });

      it('Containers > ', () => {
        cy.menu('Compute', 'Containers', 'Overview').expect_show_list_title('Container Dashboard');
        cy.menu('Compute', 'Containers', 'Providers').expect_show_list_title('Containers Providers');
        cy.menu('Compute', 'Containers', 'Projects').expect_show_list_title('Container Projects');
        cy.menu('Compute', 'Containers', 'Routes').expect_show_list_title('Container Routes');
        cy.menu('Compute', 'Containers', 'Services').expect_show_list_title('Container Services');
        cy.menu('Compute', 'Containers', 'Replicators').expect_show_list_title('Container Replicators');
        cy.menu('Compute', 'Containers', 'Pods').expect_show_list_title('Container Pods');
        cy.menu('Compute', 'Containers', 'Containers').expect_show_list_title('Container');
        cy.menu('Compute', 'Containers', 'Container Nodes').expect_show_list_title('Container Nodes');
        cy.menu('Compute', 'Containers', 'Volumes').expect_show_list_title('Persistent Volumes');
        cy.menu('Compute', 'Containers', 'Container Builds').expect_show_list_title('Container Builds');
        cy.menu('Compute', 'Containers', 'Image Registries').expect_show_list_title('Container Image Registries');
        cy.menu('Compute', 'Containers', 'Container Images').expect_show_list_title('Container Images');
        cy.menu('Compute', 'Containers', 'Container Templates').expect_show_list_title('Container Templates');
      });
    });

    it('Network >', () => {
      cy.menu('Network', 'Providers').expect_show_list_title('Network Managers');
      cy.menu('Network', 'Networks').expect_show_list_title('Cloud Networks');
      cy.menu('Network', 'Subnets').expect_show_list_title('Cloud Subnets');
      cy.menu('Network', 'Routers').expect_show_list_title('Network Routers');
      cy.menu('Network', 'Services').expect_show_list_title('Network Services');
      cy.menu('Network', 'Security Groups').expect_show_list_title('Security Groups');
      cy.menu('Network', 'Security Policies').expect_show_list_title('Security Policies');
      cy.menu('Network', 'Floating IPs').expect_show_list_title('Floating IPs');
      cy.menu('Network', 'Ports').expect_show_list_title('Network Ports');
    });

    it('Storage >', () => {
      cy.menu('Storage', 'Managers').expect_show_list_title('Storage Managers');
      cy.menu('Storage', 'Volumes').expect_show_list_title('Cloud Volumes');
      cy.menu('Storage', 'Volume Snapshots').expect_show_list_title('Cloud Volume Snapshots');
      cy.menu('Storage', 'Volume Backups').expect_show_list_title('Cloud Volume Backups');
      cy.menu('Storage', 'Volume Types').expect_show_list_title('Cloud Volume Types');
      cy.menu('Storage', 'Volume Mappings').expect_show_list_title('Volume Mappings');
      cy.menu('Storage', 'Host Initiators').expect_show_list_title('Host Initiators');
      cy.menu('Storage', 'Host Initiator Groups').expect_show_list_title('Host Initiator Groups');
      cy.menu('Storage', 'Storages').expect_show_list_title('Storages');
      cy.menu('Storage', 'Storage Resources').expect_show_list_title('Storage Resources');
      cy.menu('Storage', 'Storage Services').expect_show_list_title('Storage Services');
      cy.menu('Storage', 'Object Store Containers').expect_show_list_title('Cloud Object Store Containers');
      cy.menu('Storage', 'Object Store Objects').expect_show_list_title('Cloud Object Store Objects');
    });

    it('Automation >', () => {
      cy.menu('Automation', 'Automation', 'Providers').expect_show_list_title('Automation Managers');
      cy.menu('Automation', 'Automation', 'Configured Systems').expect_show_list_title('Configured Systems');
      cy.menu('Automation', 'Automation', 'Templates').expect_show_list_title('Templates');
      cy.menu('Automation', 'Automation', 'Jobs').expect_show_list_title('Automation Jobs');
      cy.menu('Automation', 'Configuration', 'Providers').expect_show_list_title('Configuration Managers');
      cy.menu('Automation', 'Configuration', 'Profiles').expect_show_list_title('Configuration Profiles');
      cy.menu('Automation', 'Configuration', 'Configured Systems').expect_show_list_title('Configured Systems');
      cy.menu('Automation', 'Embedded Ansible', 'Playbooks').expect_show_list_title('Playbooks (Embedded Ansible)');
      cy.menu('Automation', 'Embedded Ansible', 'Repositories').expect_show_list_title('Repositories (Embedded Ansible)');
      cy.menu('Automation', 'Embedded Ansible', 'Credentials').expect_show_list_title('Credentials');
      cy.menu('Automation', 'Embedded Automate', 'Explorer').expect_explorer_title('Datastore');

      // TODO: change the simulation page to use the correct class so we can use explorer_title_text or expect_show_list_title
      cy.menu('Automation', 'Embedded Automate', 'Simulation');
      cy.get('div.simulation-title-text').contains('Simulation');

      cy.menu('Automation', 'Embedded Automate', 'Generic Objects').expect_explorer_title('All Generic Object Definitions');
      cy.menu('Automation', 'Embedded Automate', 'Customization').expect_explorer_title('All Dialogs');
      cy.menu('Automation', 'Embedded Automate', 'Import / Export').expect_show_list_title('Import / Export');
      cy.menu('Automation', 'Embedded Automate', 'Log').expect_show_list_title('Log');
      cy.menu('Automation', 'Embedded Automate', 'Requests').expect_show_list_title('Requests');
    });

    it('Control >', () => {
      cy.menu('Control', 'Policy Profiles').expect_show_list_title('Policy Profiles');
      cy.menu('Control', 'Policies').expect_show_list_title('Policies');
      cy.menu('Control', 'Events').expect_show_list_title('Events');
      cy.menu('Control', 'Conditions').expect_show_list_title('Conditions');
      cy.menu('Control', 'Actions').expect_show_list_title('Actions');
      cy.menu('Control', 'Alert Profiles').expect_show_list_title('Alert Profiles');
      cy.menu('Control', 'Alerts').expect_show_list_title('Alerts');
      cy.menu('Control', 'Simulation').get('#left_div').contains('Event Selection');
      cy.menu('Control', 'Import / Export').expect_show_list_title('Import / Export');
      cy.menu('Control', 'Log').expect_show_list_title('Log');
    });

    it('Settings >', () => {
      cy.menu('Settings', 'My Settings').get('#main-content h3').contains('General');

      cy.menu('Settings', 'Application Settings').get('#control_settings_accord > .panel-title');
      cy.get('#explorer').contains('Settings Server');
      cy.menu('Settings', 'Tasks').get('.bx--tabs--scrollable__nav > li').contains('My Tasks');

      // About
      cy.menu('Settings', 'About').then(() => {
        cy.get('.bx--modal-container', {timeout: 10000});
      });
    });

    // TODO: combine the doc and manageiq.org test with settings above - each needs to return
    // the page back to how it was before.
    it('Documentation', () => {
      const primary = '#main-menu nav.primary';
      const secondary = 'div[role="presentation"] > .bx--side-nav__items';

      cy.get(`${primary} > ul > li`)
        .contains('a > span', 'Settings')
        .click();
      cy.get(`${secondary} > li`)
        .contains('a > span', 'Documentation').parent().then((a) => {
          return a[0].href.includes('manageiq.org/docs');
        });
    });

    it('ManageIQ.org', () => {
      const primary = '#main-menu nav.primary';
      const secondary = 'div[role="presentation"] > .bx--side-nav__items';

      cy.get(`${primary} > ul > li`)
        .contains('a > span', 'Settings')
        .click();

      cy.get(`${secondary} > li`)
        .contains('a > span', 'ManageIQ.org').parent().then((a) => {
          return a[0].href.includes('manageiq.org');
        });
    });
  });
});
