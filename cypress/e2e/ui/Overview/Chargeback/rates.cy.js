/* eslint-disable no-undef */

describe('Rates', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Chargeback', 'Rates');
  });

  it('Chargeback rates page loads correctly', () => {
    cy.expect_show_list_title('Chargeback Rates');
  });

  it('Loads the default compute chargeback rate', () => {
    cy.gtlClickRow([{title: 'Default', number: 1}, {title: 'Compute', number: 2}]).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['CPU', ['Allocated CPU Count', 'vCPUs Allocated over Time Period'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], '$ [United States Dollar] / Hour / Cpu'];
      rows[1] = ['CPU', ['Used CPU', 'CPU Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.02'], '$ [United States Dollar] / Hour / MHz'];
      rows[2] = ['CPU Cores', ['Allocated CPU Cores', 'CPU Cores Allocated Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], '$ [United States Dollar] / Hour / Cpu core'];
      rows[3] = ['CPU Cores', ['Used CPU Cores', 'CPU Cores Used Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.02'], '$ [United States Dollar] / Hour / Cpu core'];
      rows[4] = ['Disk I/O', ['Used Disk I/O', 'Disk I/O Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.005'], '$ [United States Dollar] / Hour / KBps'];
      rows[5] = ['Fixed', ['Fixed Compute Cost 1', 'Fixed Compute Metric 1'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour'];
      rows[6] = ['Fixed', ['Fixed Compute Cost 2', 'Fixed Compute Metric 2'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour'];
      rows[7] = ['Memory', ['Allocated Memory', 'Memory Allocated over Time Period'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour / MB'];
      rows[8] = ['Memory', ['Used Memory', 'Memory Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.02'], '$ [United States Dollar] / Hour / MB'];
      rows[9] = ['Network I/O', ['Used Network I/O', 'Network I/O Used'], ['0.0', '100.0'], ['100.0', 'Infinity'], ['0.5', '0.5'], ['0.0', '0.005'], '$ [United States Dollar] / Hour / KBps'];
      cy.expect_rates_table(headers, rows);
    });
  });

  it('Loads the default storage chargeback rate', () => {
    cy.gtlClickRow([{title: 'Default', number: 1}, {title: 'Storage', number: 2}]).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Storage');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['Fixed', ['Fixed Storage Cost 1', 'Fixed Storage 1 Metric'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour'];
      rows[1] = ['Fixed', ['Fixed Storage Cost 2', 'Fixed Storage 2 Metric'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour'];
      rows[2] = ['Storage', ['Allocated Disk Storage', 'Storage Allocated'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], '$ [United States Dollar] / Hour / GB'];
      rows[3] = ['Storage', ['Used Disk Storage', 'Storage Used'], ['0.0'], ['Infinity'], ['0.0'], ['2.0'], '$ [United States Dollar] / Hour / GB'];
      cy.expect_rates_table(headers, rows);
    });
  });

  it('Loads the default container image chargeback rate', () => {
    cy.gtlClickRow([{title: 'Default Container Image Rate', number: 1}]).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default Container Image Rate');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['CPU', ['Allocated CPU Count', 'vCPUs Allocated over Time Period'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], '$ [United States Dollar] / Hour / Cpu'];
      rows[1] = ['CPU', ['Used CPU', 'CPU Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.02'], '$ [United States Dollar] / Hour / MHz'];
      rows[2] = ['CPU Cores', ['Allocated CPU Cores', 'CPU Cores Allocated Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], '$ [United States Dollar] / Hour / Cpu core'];
      rows[3] = ['CPU Cores', ['Used CPU Cores', 'CPU Cores Used Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.02'], '$ [United States Dollar] / Hour / Cpu core'];
      rows[4] = ['Disk I/O', ['Used Disk I/O', 'Disk I/O Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.005'], '$ [United States Dollar] / Hour / KBps'];
      rows[5] = ['Fixed', ['Fixed Compute Cost 1', 'Fixed Compute Metric 1'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour'];
      rows[6] = ['Fixed', ['Fixed Compute Cost 2', 'Fixed Compute Metric 2'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour'];
      rows[7] = ['Memory', ['Allocated Memory', 'Memory Allocated over Time Period'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], '$ [United States Dollar] / Hour / MB'];
      rows[8] = ['Memory', ['Used Memory', 'Memory Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.02'], '$ [United States Dollar] / Hour / MB'];
      rows[9] = ['Network I/O', ['Used Network I/O', 'Network I/O Used'], ['0.0', '100.0'], ['100.0', 'Infinity'], ['0.5', '0.5'], ['0.0', '0.005'], '$ [United States Dollar] / Hour / KBps'];
      cy.expect_rates_table(headers, rows);
    });
  });

  it('Cancel button works on the form', () => {
    cy.gtlGetRows([1]).then((originalRates) => {
      cy.toolbar('Configuration', 'Add a new Chargeback Rate');
      cy.get('[width="100%"] > tbody > tr > td > .btn-default').click();
      cy.get('.miq-toolbar-group');
      cy.url().should('include', 'chargeback_rate/show_list');
      cy.get('.alert').contains('Add of new Chargeback Rate was cancelled by the user');
      cy.gtlGetRows([1]).then((newRates) => {
        newRates.forEach((newRate) => {
          expect(originalRates).to.deep.include(newRate);
          originalRates.shift();
        });
      });
    });
  });

  it('Can add, edit and delete a compute chargeback rate', () => {
    let currency = '';
    cy.toolbar('Configuration', 'Add a new Chargeback Rate');
    cy.get('#description').type('Cypress test compute chargeback rates');
    cy.get(':nth-child(2) > .col-md-8 > .btn-group > .btn').click();
    cy.get(':nth-child(5) > .form-group > .col-md-8 > .btn-group > .btn').click();
    cy.get('[data-original-index="25"]').then((option) => {
      currency = option[0].innerText;
      cy.get(option).click();
    });
    cy.get('#per_time_1').select('Weekly');
    cy.get('#per_unit_1').select('KHz');
    cy.get('#finish_1_0').type('50');
    cy.get('#fixed_rate_1_0').clear().type('100');
    cy.get('#rate_detail_row_1_0 > .action-cell > .btn').click();
    cy.get('#start_1_1').type('50');
    cy.get('#fixed_rate_1_0').clear().type('75');
    cy.get('#start_1_1').clear().type('50');
    cy.get('#variable_rate_1_0').clear().type('5');
    cy.get('#variable_rate_1_1').clear().type('10');

    cy.get('#per_time_4').select('Daily');
    cy.get('#per_unit_4').select('MBps');
    cy.get('#finish_4_0').type('10000');
    cy.get('#fixed_rate_4_0').clear().type('1.0');
    cy.get('#variable_rate_4_0').clear().type('1.0');
    cy.get('#rate_detail_row_4_0 > .action-cell > .btn').click();
    cy.get('#fixed_rate_4_1').clear().type('2.0');
    cy.get('#variable_rate_4_1').clear().type('2.0');

    cy.get('#finish_9_0').clear();
    cy.get('#rate_detail_row_9_1 > .action-cell > .btn').click();

    cy.get('.btn-primary').click();
    cy.get('#gtl_div').contains('Cypress test compute chargeback rates');
    cy.gtlClickRow([{title: 'Cypress test compute chargeback rates', number: 1}]).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Cypress test compute chargeback rates');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['CPU', ['Allocated CPU Count', 'vCPUs Allocated over Time Period'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], `${currency} / Hour / Cpu`];
      rows[1] = ['CPU', ['Used CPU', 'CPU Used'], ['0.0', '50.0'], ['50.0', 'Infinity'], ['75.0', '0.0'], ['5.0', '10.0'], `${currency} / Week / KHz`];
      rows[2] = ['CPU Cores', ['Allocated CPU Cores', 'CPU Cores Allocated Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], `${currency} / Hour / Cpu core`];
      rows[3] = ['CPU Cores', ['Used CPU Cores', 'CPU Cores Used Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.02'], `${currency} / Hour / Cpu core`];
      rows[4] = ['Disk I/O', ['Used Disk I/O', 'Disk I/O Used'], ['0.0', '10000.0'], ['10000.0', 'Infinity'], ['1.0', '2.0'], ['1.0', '2.0'], `${currency} / Day / MBps`];
      rows[5] = ['Fixed', ['Fixed Compute Cost 1', 'Fixed Compute Metric 1'], ['0.0'], ['Infinity'], ['0.0'], ['-'], `${currency} / Hour`];
      rows[6] = ['Fixed', ['Fixed Compute Cost 2', 'Fixed Compute Metric 2'], ['0.0'], ['Infinity'], ['0.0'], ['-'], `${currency} / Hour`];
      rows[7] = ['Memory', ['Allocated Memory', 'Memory Allocated over Time Period'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], `${currency} / Hour / MB`];
      rows[8] = ['Memory', ['Used Memory', 'Memory Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.02'], `${currency} / Hour / MB`];
      rows[9] = ['Network I/O', ['Used Network I/O', 'Network I/O Used'], ['0.0'], ['Infinity'], ['0.5'], ['0.0'], `${currency} / Hour / KBps`];
      cy.expect_rates_table(headers, rows);
    }).then(() => {
      cy.toolbar('Configuration', 'Edit this Chargeback Rate');
      cy.get('#description').type('{moveToEnd} edit');
      cy.get('.btn-group > .btn').click();
      cy.get('[data-original-index="144"]').then((option) => {
        currency = option[0].innerText;
        cy.get(option).click();
      });
      cy.get('#per_time_0').select('Daily');
      cy.get('#finish_0_0').type('100');
      cy.get('#fixed_rate_0_0').clear().type('2.0');
      cy.get('#rate_detail_row_0_0 > .action-cell > .btn').click();
      cy.get('#fixed_rate_0_1').clear().type('10.0');
      cy.get('#variable_rate_0_0').clear().type('10');
      cy.get('#variable_rate_0_1').clear().type('100');

      cy.get('#rate_detail_row_1_1 > .action-cell > .btn').click();

      cy.get('#per_time_4').select('Hourly');
      cy.get('#per_unit_4').select('Bps');

      cy.get('#finish_1_0').clear();

      cy.get('#buttons_on > .btn-primary').click({ force: true });
    }).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Cypress test compute chargeback rates edit');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['CPU', ['Allocated CPU Count', 'vCPUs Allocated over Time Period'], ['0.0', '100.0'], ['100.0', 'Infinity'], ['2.0', '10.0'], ['10.0', '100.0'], `${currency} / Day / Cpu`];
      rows[1] = ['CPU', ['Used CPU', 'CPU Used'], ['0.0'], ['Infinity'], ['75.0'], ['5.0'], `${currency} / Week / KHz`];
      rows[2] = ['CPU Cores', ['Allocated CPU Cores', 'CPU Cores Allocated Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], `${currency} / Hour / Cpu core`];
      rows[3] = ['CPU Cores', ['Used CPU Cores', 'CPU Cores Used Metric'], ['0.0'], ['Infinity'], ['1.0'], ['0.02'], `${currency} / Hour / Cpu core`];
      rows[4] = ['Disk I/O', ['Used Disk I/O', 'Disk I/O Used'], ['0.0', '10000.0'], ['10000.0', 'Infinity'], ['1.0', '2.0'], ['1.0', '2.0'], `${currency} / Day / Bps`];
      rows[5] = ['Fixed', ['Fixed Compute Cost 1', 'Fixed Compute Metric 1'], ['0.0'], ['Infinity'], ['0.0'], ['-'], `${currency} / Hour`];
      rows[6] = ['Fixed', ['Fixed Compute Cost 2', 'Fixed Compute Metric 2'], ['0.0'], ['Infinity'], ['0.0'], ['-'], `${currency} / Hour`];
      rows[7] = ['Memory', ['Allocated Memory', 'Memory Allocated over Time Period'], ['0.0'], ['Infinity'], ['0.0'], ['0.0'], `${currency} / Hour / MB`];
      rows[8] = ['Memory', ['Used Memory', 'Memory Used'], ['0.0'], ['Infinity'], ['0.0'], ['0.02'], `${currency} / Hour / MB`];
      rows[9] = ['Network I/O', ['Used Network I/O', 'Network I/O Used'], ['0.0'], ['Infinity'], ['0.5'], ['0.0'], `${currency} / Hour / KBps`];
      cy.expect_rates_table(headers, rows);
    }).then(() => {
      cy.toolbar('Configuration', 'Remove from the VMDB');
      cy.gtlGetRows([1]).then((rows) => {
        rows.forEach((row) => {
          expect(row).to.not.eq('Cypress test compute chargeback rates edit');
          expect(row).to.not.eq('Cypress test compute chargeback rates');
        });
      });
    });
  });

  it('Can add, edit and delete a storage chargeback rate', () => {
    let currency = '';
    cy.intercept('POST', '/chargeback_rate/form_field_changed/new?rate_type=Storage').as('fieldChange');
    cy.toolbar('Configuration', 'Add a new Chargeback Rate');
    cy.get('#description').type('Cypress test storage chargeback rates');
    cy.get(':nth-child(2) > .col-md-8 > .btn-group > .btn').click();
    cy.get(':nth-child(2) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"]').click();
    cy.get(':nth-child(5) > .form-group > .col-md-8 > .btn-group > .btn').click();
    cy.get('[data-original-index="25"]').then((option) => {
      currency = option[0].innerText;
      cy.get(option).click();
    });
    cy.wait('@fieldChange');
    cy.get('#per_time_0').select('Weekly');
    cy.get('#finish_0_0').type('50');
    cy.get('#fixed_rate_0_0').clear().type('100');
    cy.get('#rate_detail_row_0_0 > .action-cell > .btn').click();
    cy.get('#fixed_rate_0_1').clear().type('75');
    cy.get('#per_time_2').select('Yearly');
    cy.get('#per_unit_2').select('MB');
    cy.get('#finish_3_0').type('10000');
    cy.get('#rate_detail_row_3_0 > .action-cell > .btn').click();
    cy.get('.btn-primary').click();
    cy.get('#gtl_div').contains('Cypress test storage chargeback rates');
    cy.gtlClickRow([{title: 'Cypress test storage chargeback rates', number: 1}]).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Cypress test storage chargeback rates');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Storage');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['Fixed', ['Fixed Storage Cost 1', 'Fixed Storage 1 Metric'], ['0.0', '50.0'], ['50.0', 'Infinity'], ['100.0', '75.0'], ['-', '-'], `${currency} / Week`];
      rows[1] = ['Fixed', ['Fixed Storage Cost 2', 'Fixed Storage 2 Metric'], ['0.0'], ['Infinity'], ['0.0'], ['-'], `${currency} / Hour`];
      rows[2] = ['Storage', ['Allocated Disk Storage', 'Storage Allocated'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], `${currency} / Year / MB`];
      rows[3] = ['Storage', ['Used Disk Storage', 'Storage Used'], ['0.0', '10000.0'], ['10000.0', 'Infinity'], ['0.0', '0.0'], ['2.0', '0.0'], `${currency} / Hour / GB`];
      cy.expect_rates_table(headers, rows);
    }).then(() => {
      cy.toolbar('Configuration', 'Edit this Chargeback Rate');
      cy.get('#description').type('{moveToEnd} edit');
      cy.get('.btn-group > .btn').click();
      cy.get('[data-original-index="144"]').then((option) => {
        currency = option[0].innerText;
        cy.get(option).click();
      });
      cy.get('#per_time_0').select('Daily');
      cy.get('#rate_detail_row_0_1 > .action-cell > .btn').click();
      cy.get('#finish_0_0').clear();
      cy.get('#rate_detail_row_1_0 > .action-cell > .btn').click();
      cy.get('#finish_1_0').type('100');
      cy.get('#start_1_1').type('100', {force: true});
      cy.get('#fixed_rate_1_0').clear().type('1');
      cy.get('#per_time_2').select('Monthly');
      cy.get('#per_unit_2').select('KB');
      cy.get('#finish_2_0').clear();
      cy.get('#variable_rate_2_0').clear({force: true }).type('100', { force: true });
      cy.get('#buttons_on > .btn-primary').click({ force: true });
    }).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Cypress test storage chargeback rates edit');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Storage');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['Fixed', ['Fixed Storage Cost 1', 'Fixed Storage 1 Metric'], ['0.0'], ['Infinity'], ['100.0'], ['-'], `${currency} / Day`];
      rows[1] = ['Fixed', ['Fixed Storage Cost 2', 'Fixed Storage 2 Metric'], ['0.0', '100.0'], ['100.0', 'Infinity'], ['1.0', '0.0'], ['-', '-'], `${currency} / Hour`];
      rows[2] = ['Storage', ['Allocated Disk Storage', 'Storage Allocated'], ['0.0'], ['Infinity'], ['1.0'], ['100.0'], `${currency} / Month / KB`];
      rows[3] = ['Storage', ['Used Disk Storage', 'Storage Used'], ['0.0', '10000.0'], ['10000.0', 'Infinity'], ['0.0', '0.0'], ['2.0', '0.0'], `${currency} / Hour / GB`];
      cy.expect_rates_table(headers, rows);
    }).then(() => {
      cy.toolbar('Configuration', 'Remove from the VMDB');
      cy.gtlGetRows([1]).then((rows) => {
        rows.forEach((row) => {
          expect(row).to.not.eq('Cypress test storage chargeback rates edit');
          expect(row).to.not.eq('Cypress test storage chargeback rates');
        });
      });
    });
  });

  it('Copy a chargeback rate', () => {
    cy.gtlClickRow([{title: 'Default', number: 1}, {title: 'Storage', number: 2}]).then(() => {
      cy.toolbar('Configuration', 'Copy this Chargeback Rate');
      cy.get('.btn-primary').click();
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('copy of Default');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Storage');

      const headers = ['Group', 'Description (Column Name in Report)', 'Range Start', 'Range Finish', 'Rate Fixed', 'Rate Variable', 'Units'];
      const rows = [];
      rows[0] = ['Fixed', ['Fixed Storage Cost 1', 'Fixed Storage 1 Metric'], ['0.0'], ['Infinity'], ['0.0'], ['-'], '$ [United States Dollar] / Hour'];
      rows[1] = ['Fixed', ['Fixed Storage Cost 2', 'Fixed Storage 2 Metric'], ['0.0'], ['Infinity'], ['0.0'], ['-'], '$ [United States Dollar] / Hour'];
      rows[2] = ['Storage', ['Allocated Disk Storage', 'Storage Allocated'], ['0.0'], ['Infinity'], ['1.0'], ['0.0'], '$ [United States Dollar] / Hour / GB'];
      rows[3] = ['Storage', ['Used Disk Storage', 'Storage Used'], ['0.0'], ['Infinity'], ['0.0'], ['2.0'],  '$ [United States Dollar] / Hour / GB'];
      cy.expect_rates_table(headers, rows);

      cy.toolbar('Configuration', 'Remove from the VMDB');
      cy.gtlGetRows([1]).then((rows) => {
        rows.forEach((row) => {
          expect(row).to.not.eq('copy of default');
        });
      });
    });
  });
});
