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
    describe('Overview >', () => {
      it('Dashboard', () => {
        cy.menu('Overview', 'Dashboard').get('#main-menu');
      });

      it('Reports', () => {
        cy.menu('Overview', 'Reports').expect_show_list_title('All Saved Reports');
      });

      it('Utilization', () => {
        cy.menu('Overview', 'Utilization').expect_explorer_title('Enterprise'); // Need to have simulate_queue_worker running to prevent this page from being stuck on loading (leads tot error in Firefox tests)
        cy.visit('/'); // This line is needed for the Firefox cypress tests to prevent this page from being stuck and throwing errors
      });

      describe('Chargeback > ', () => {
        it('Reports', () => {
          cy.menu('Overview', 'Chargeback', 'Reports').expect_show_list_title('Chargeback Saved Reports');
        });

        it('Rates', () => {
          cy.menu('Overview', 'Chargeback', 'Rates').expect_show_list_title('Chargeback Rates');
        });

        it('Assignments', () => {
          cy.menu('Overview', 'Chargeback', 'Assignments').expect_show_list_title('Chargeback Assignments');
        });
      });

      it('Optimization', () => {
        cy.menu('Overview', 'Optimization').expect_show_list_title('Optimization');
      });
    });

    describe('Services >', () => {
      it('My Services', () => {
        cy.menu('Services', 'My Services').expect_show_list_title('Services');
      });

      it('Catalogs', () => {
        cy.menu('Services', 'Catalogs').expect_explorer_title('All Services');
      });

      it('Workloads', () => {
        cy.menu('Services', 'Workloads').expect_explorer_title('All VMs & Instances');
      });

      it('Requests', () => {
        cy.menu('Services', 'Requests').expect_show_list_title('Requests');
      });
    });

    describe('Compute >', () => {
      describe('Clouds > ', () => {
        it('Providers', () => {
          cy.menu('Compute', 'Clouds', 'Providers').expect_show_list_title('Cloud Providers');
        });

        it('Availability Zones', () => {
          cy.menu('Compute', 'Clouds', 'Availability Zones').expect_show_list_title('Availability Zones');
        });

        it('Host Aggregates', () => {
          cy.menu('Compute', 'Clouds', 'Host Aggregates').expect_show_list_title('Host Aggregates');
        });

        it('Tenants', () => {
          cy.menu('Compute', 'Clouds', 'Tenants').expect_show_list_title('Cloud Tenants');
        });

        it('Flavors', () => {
          cy.menu('Compute', 'Clouds', 'Flavors').expect_show_list_title('Flavors');
        });

        it('Instances', () => {
          cy.menu('Compute', 'Clouds', 'Instances').expect_explorer_title('All Instances by Provider');
        });

        it('Stacks', () => {
          cy.menu('Compute', 'Clouds', 'Stacks').expect_show_list_title('Orchestration Stacks');
        });

        it('Key Pairs', () => {
          cy.menu('Compute', 'Clouds', 'Key Pairs').expect_show_list_title('Key Pairs');
        });

        it('Placement Groups', () => {
          cy.menu('Compute', 'Clouds', 'Placement Groups').expect_show_list_title('Placement Groups');
        });

        it('Databases', () => {
          cy.menu('Compute', 'Clouds', 'Databases').expect_show_list_title('Cloud Databases');
        });
      });

      describe('Infrastructure > ', () => {
        it('Providers', () => {
          cy.menu('Compute', 'Infrastructure', 'Providers').expect_show_list_title('Infrastructure Providers');
        });

        it('Clusters', () => {
          cy.menu('Compute', 'Infrastructure', 'Clusters').expect_show_list_title('Clusters');
        });

        it('Hosts', () => {
          cy.menu('Compute', 'Infrastructure', 'Hosts').expect_show_list_title('Hosts');
        });

        it('Virtual Machines', () => {
          cy.menu('Compute', 'Infrastructure', 'Virtual Machines').expect_explorer_title('All VMs & Templates');
        });

        it('Resource Pools', () => {
          cy.menu('Compute', 'Infrastructure', 'Resource Pools').expect_show_list_title('Resource Pools');
        });

        it('Datastores', () => {
          cy.menu('Compute', 'Infrastructure', 'Datastores').expect_explorer_title('All Datastores');
        });

        it('PXE', () => {
          cy.menu('Compute', 'Infrastructure', 'PXE').expect_explorer_title('All PXE Servers');
        });

        it('Networking', () => {
          cy.menu('Compute', 'Infrastructure', 'Networking').expect_explorer_title('All Switches');
        });
      });

      describe('Physical Infrastructure > ', () => {
        it('Overview', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Overview').get('.card-pf-aggregate-status-title');
        });

        it('Providers', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Providers').expect_show_list_title('Physical Infrastructure Providers');
        });

        it('Chassis', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Chassis').expect_show_list_title('Physical Chassis');
        });

        it('Racks', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Racks').expect_show_list_title('Physical Racks');
        });

        it('Servers', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Servers').expect_show_list_title('Physical Servers');
        });

        it('Storages', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Storages').expect_show_list_title('Physical Storages');
        });

        it('Switches', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Switches').expect_show_list_title('Physical Switches');
        });

        it('Firmware Registry', () => {
          cy.menu('Compute', 'Physical Infrastructure', 'Firmware Registry').expect_show_list_title('Firmware Registries');
        });
      });

      describe('Containers > ', () => {
        it('Overview', () => {
          cy.menu('Compute', 'Containers', 'Overview').expect_show_list_title('Container Dashboard');
        });

        it('Providers', () => {
          cy.menu('Compute', 'Containers', 'Providers').expect_show_list_title('Containers Providers');
        });

        it('Projects', () => {
          cy.menu('Compute', 'Containers', 'Projects').expect_show_list_title('Container Projects');
        });

        it('Routes', () => {
          cy.menu('Compute', 'Containers', 'Routes').expect_show_list_title('Container Routes');
        });

        it('Services', () => {
          cy.menu('Compute', 'Containers', 'Services').expect_show_list_title('Container Services');
        });

        it('Replicators', () => {
          cy.menu('Compute', 'Containers', 'Replicators').expect_show_list_title('Container Replicators');
        });

        it('Pods', () => {
          cy.menu('Compute', 'Containers', 'Pods').expect_show_list_title('Container Pods');
        });

        it('Pods', () => {
          cy.menu('Compute', 'Containers', 'Containers').expect_show_list_title('Container');
        });

        it('Container Nodes', () => {
          cy.menu('Compute', 'Containers', 'Container Nodes').expect_show_list_title('Container Nodes');
        });

        it('Volumes', () => {
          cy.menu('Compute', 'Containers', 'Volumes').expect_show_list_title('Persistent Volumes');
        });

        it('Container Builds', () => {
          cy.menu('Compute', 'Containers', 'Container Builds').expect_show_list_title('Container Builds');
        });

        it('Image Registries', () => {
          cy.menu('Compute', 'Containers', 'Image Registries').expect_show_list_title('Container Image Registries');
        });

        it('Container Images', () => {
          cy.menu('Compute', 'Containers', 'Container Images').expect_show_list_title('Container Images');
        });

        it('Container Templates', () => {
          cy.menu('Compute', 'Containers', 'Container Templates').expect_show_list_title('Container Templates');
        });
      });
    });

    describe('Network >', () => {
      it('Providers', () => {
        cy.menu('Network', 'Providers').expect_show_list_title('Network Managers');
      });

      it('Networks', () => {
        cy.menu('Network', 'Networks').expect_show_list_title('Cloud Networks');
      });

      it('Subnets', () => {
        cy.menu('Network', 'Subnets').expect_show_list_title('Cloud Subnets');
      });

      it('Routers', () => {
        cy.menu('Network', 'Routers').expect_show_list_title('Network Routers');
      });

      it('Services', () => {
        cy.menu('Network', 'Services').expect_show_list_title('Network Services');
      });

      it('Security Groups', () => {
        cy.menu('Network', 'Security Groups').expect_show_list_title('Security Groups');
      });

      it('Security Policies', () => {
        cy.menu('Network', 'Security Policies').expect_show_list_title('Security Policies');
      });

      it('Floating IPs', () => {
        cy.menu('Network', 'Floating IPs').expect_show_list_title('Floating IPs');
      });

      it('Ports', () => {
        cy.menu('Network', 'Ports').expect_show_list_title('Network Ports');
      });
    });

    describe('Storage >', () => {
      it('Managers', () => {
        cy.menu('Storage', 'Managers').expect_show_list_title('Storage Managers');
      });

      it('Volumes', () => {
        cy.menu('Storage', 'Volumes').expect_show_list_title('Cloud Volumes');
      });

      it('Volume Snapshots', () => {
        cy.menu('Storage', 'Volume Snapshots').expect_show_list_title('Cloud Volume Snapshots');
      });

      it('Volume Backups', () => {
        cy.menu('Storage', 'Volume Backups').expect_show_list_title('Cloud Volume Backups');
      });

      it('Volume Types', () => {
        cy.menu('Storage', 'Volume Types').expect_show_list_title('Cloud Volume Types');
      });

      it('Volume Mappings', () => {
        cy.menu('Storage', 'Volume Mappings').expect_show_list_title('Volume Mappings');
      });

      it('Host Initiators', () => {
        cy.menu('Storage', 'Host Initiators').expect_show_list_title('Host Initiators');
      });

      it('Host Initiator Groups', () => {
        cy.menu('Storage', 'Host Initiator Groups').expect_show_list_title('Host Initiator Groups');
      });

      it('Storages', () => {
        cy.menu('Storage', 'Storages').expect_show_list_title('Storages');
      });

      it('Storage Resources', () => {
        cy.menu('Storage', 'Storage Resources').expect_show_list_title('Storage Resources');
      });

      it('Storage Services', () => {
        cy.menu('Storage', 'Storage Services').expect_show_list_title('Storage Services');
      });

      it('Object Store Containers', () => {
        cy.menu('Storage', 'Object Store Containers').expect_show_list_title('Cloud Object Store Containers');
      });

      it('Object Store Onjects', () => {
        cy.menu('Storage', 'Object Store Objects').expect_show_list_title('Cloud Object Store Objects');
      });
    });

    describe('Automation >', () => {
      describe('Automation >', () => {
        it('Providers', () => {
          cy.menu('Automation', 'Automation', 'Providers').expect_show_list_title('Automation Managers');
        });

        it('Configured Systems', () => {
          cy.menu('Automation', 'Automation', 'Configured Systems').expect_show_list_title('Configured Systems');
        });

        it('Templates', () => {
          cy.menu('Automation', 'Automation', 'Templates').expect_show_list_title('Templates (Ansible Tower)');
        });

        it('Jobs', () => {
          cy.menu('Automation', 'Automation', 'Jobs').expect_show_list_title('Ansible Tower Jobs');
        });
      });

      describe('Configuration >', () => {
        it('Providers', () => {
          cy.menu('Automation', 'Configuration', 'Providers').expect_show_list_title('Configuration Managers');
        });

        it('Profiles', () => {
          cy.menu('Automation', 'Configuration', 'Profiles').expect_show_list_title('Configuration Profiles');
        });

        it('Configured Systems', () => {
          cy.menu('Automation', 'Configuration', 'Configured Systems').expect_show_list_title('Configured Systems');
        });
      });

      describe('Embedded Ansible', () => {
        it('Playbooks', () => {
          cy.menu('Automation', 'Embedded Ansible', 'Playbooks').expect_show_list_title('Playbooks (Embedded Ansible)');
        });

        it('Repositories', () => {
          cy.menu('Automation', 'Embedded Ansible', 'Repositories').expect_show_list_title('Repositories (Embedded Ansible)');
        });

        it('Credentials', () => {
          cy.menu('Automation', 'Embedded Ansible', 'Credentials').expect_show_list_title('Credentials');
        });
      });

      describe('Embedded Automate', () => {
        it('Explorer', () => {
          cy.menu('Automation', 'Embedded Automate', 'Explorer').expect_explorer_title('Datastore');
        });

        it('Simulation', () => {
          cy.menu('Automation', 'Embedded Automate', 'Simulation').expect_explorer_title('Simulation');
        });

        it('Generic Objects', () => {
          cy.menu('Automation', 'Embedded Automate', 'Generic Objects').expect_explorer_title('All Generic Object Definitions');
        });

        it('Customization', () => {
          cy.menu('Automation', 'Embedded Automate', 'Customization').expect_explorer_title('All Dialogs');
        });

        it('Import / Export ', () => {
          cy.menu('Automation', 'Embedded Automate', 'Import / Export').expect_show_list_title('Import / Export');
        });

        it('Log', () => {
          cy.menu('Automation', 'Embedded Automate', 'Log').expect_show_list_title('Log');
        });

        it('Log', () => {
          cy.menu('Automation', 'Embedded Automate', 'Requests').expect_show_list_title('Requests');
        });
      });
    });

    describe('Control >', () => {
      it('Policy Profiles', () => {
        cy.menu('Control', 'Policy Profiles').expect_show_list_title('Policy Profiles');
      });

      it('Policies', () => {
        cy.menu('Control', 'Policies').expect_show_list_title('Policies');
      });

      it('Events', () => {
        cy.menu('Control', 'Events').expect_show_list_title('Events');
      });

      it('Conditions', () => {
        cy.menu('Control', 'Conditions').expect_show_list_title('Conditions');
      });

      it('Actions', () => {
        cy.menu('Control', 'Actions').expect_show_list_title('Actions');
      });

      it('Alert Profiles', () => {
        cy.menu('Control', 'Alert Profiles').expect_show_list_title('Alert Profiles');
      });

      it('Alerts', () => {
        cy.menu('Control', 'Alerts').expect_show_list_title('Alerts');
      });

      it('Simulation', () => {
        cy.menu('Control', 'Simulation').get('#left_div').contains('Event Selection');
      });

      it('Import / Export ', () => {
        cy.menu('Control', 'Import / Export').expect_show_list_title('Import / Export');
      });

      it('Log', () => {
        cy.menu('Control', 'Log').expect_show_list_title('Log');
      });
    });

    describe('Settings >', () => {
      it('My Settings ', () => {
        cy.menu('Settings', 'My Settings').get('#main-content h3').contains('General');
      });

      it('Application Settings', () => {
        cy.menu('Settings', 'Application Settings').get('#control_settings_accord > .panel-title');
        cy.get('#explorer').contains('Settings Server');
      });

      it('Tasks', () => {
        cy.menu('Settings', 'Tasks').get('.bx--tabs--scrollable__nav > li').contains('My Tasks');
      });

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

      it('About', () => {
        cy.menu('Settings', 'About').then(() => {
          cy.wait(50000); // Need to wait before getting the modal container or else the test fails
          cy.get('.bx--modal-container');
        });
      });
    });
  });
});
