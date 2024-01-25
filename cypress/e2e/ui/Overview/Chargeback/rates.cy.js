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

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Allocated CPU Count');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'vCPUs Allocated over Time Period');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / Cpu');

      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Used');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.expect_text(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / MHz');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Allocated Metric');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / Cpu core');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Used Metric');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.expect_text(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / Cpu core');

      cy.expect_text(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line', 'Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Disk I/O Used');
      cy.expect_text(':nth-child(5) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(5) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(5) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(5) > :nth-child(6) > .cell > .array_list > .list_row', '0.005');
      cy.expect_text(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / KBps');

      cy.expect_text(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 1');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2', 'Fixed Compute Metric 1');
      cy.expect_text(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 2');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Compute Metric 2');
      cy.expect_text(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Allocated over Time Period');
      cy.expect_text(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / MB');

      cy.expect_text(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Used');
      cy.expect_text(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.expect_text(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / MB');

      cy.expect_text(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line', 'Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Network I/O Used');
      cy.expect_text(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > .cell > .array_list > :nth-child(2)', '100.0');
      cy.expect_text(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row', '100.0');
      cy.expect_text(':nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row', '0.5');
      cy.expect_text(':nth-child(5) > .cell > .array_list > :nth-child(2)', '0.5');
      cy.expect_text(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > .cell > .array_list > :nth-child(2)', '0.005');
      cy.expect_text(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / KBps');
    });
  });

  it('Loads the default storage chargeback rate', () => {
    cy.gtlClickRow([{title: 'Default', number: 1}, {title: 'Storage', number: 2}]).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Storage');

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 1');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'Fixed Storage 1 Metric');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 2');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Storage 2 Metric');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Disk Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Allocated');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / GB');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Used');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row', '2.0');
      cy.expect_text(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / GB');
    });
  });

  it('Loads the default container image chargeback rate', () => {
    cy.gtlClickRow([{title: 'Default Container Image Rate', number: 1}]).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default Container Image Rate');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Allocated CPU Count');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'vCPUs Allocated over Time Period');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / Cpu');

      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Used');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.expect_text(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / MHz');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Allocated Metric');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / Cpu core');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Used Metric');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.expect_text(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / Cpu core');

      cy.expect_text(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line', 'Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Disk I/O Used');
      cy.expect_text(':nth-child(5) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(5) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / KBps');
      cy.expect_text(':nth-child(5) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(5) > :nth-child(6) > .cell > .array_list > .list_row', '0.005');

      cy.expect_text(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 1');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Compute Metric 1');
      cy.expect_text(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 2');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Compute Metric 2');
      cy.expect_text(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Allocated over Time Period');
      cy.expect_text(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / MB');

      cy.expect_text(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Used');
      cy.expect_text(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.expect_text(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / MB');

      cy.expect_text(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line', 'Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Network I/O Used');
      cy.expect_text(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > .cell > .array_list > :nth-child(2)', '100.0');
      cy.expect_text(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row', '100.0');
      cy.expect_text(':nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row', '0.5');
      cy.expect_text(':nth-child(5) > .cell > .array_list > :nth-child(2)', '0.5');
      cy.expect_text(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > .cell > .array_list > :nth-child(2)', '0.005');
      cy.expect_text(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / KBps');
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

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Allocated CPU Count');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'vCPUs Allocated over Time Period');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu');

      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '50.0');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Used');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(2)', '50.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '75.0');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(2)', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(6) > .cell > .array_list > :nth-child(1)', '5.0');
      cy.expect_text(':nth-child(2) > :nth-child(6) > .cell > .array_list > :nth-child(2)', '10.0');
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Week / KHz');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Allocated Metric');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Used Metric');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.expect_text(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line', 'Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Disk I/O Used');
      cy.expect_text(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(2)', '10000.0');
      cy.expect_text(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '10000.0');
      cy.expect_text(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '1.0');
      cy.expect_text(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(2)', '2.0');
      cy.expect_text(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(1)', '1.0');
      cy.expect_text(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(2)', '2.0');
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains('Day / MBps');

      cy.expect_text(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 1');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Compute Metric 1');
      cy.expect_text(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row', '-');
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.expect_text(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 2');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Compute Metric 2');
      cy.expect_text(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(6) > .cell > .array_list > .list_row', '-');
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.expect_text(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Allocated over Time Period');
      cy.expect_text(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.expect_text(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Used');
      cy.expect_text(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.expect_text(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line', 'Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Network I/O Used');
      cy.expect_text(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row', '0.5');
      cy.expect_text(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / KBps');
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

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Allocated CPU Count');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'vCPUs Allocated over Time Period');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(2)', '100.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '100.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '2.0');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(2)', '10.0');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > :nth-child(1)', '10.0');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > :nth-child(2)', '100.0');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row', '10.0');
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Day / Cpu');

      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'CPU');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU');
      cy.expect_text(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Used');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row', '75.0');
      cy.expect_text(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row', '5.0');
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Week / KHz');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated CPU Cores');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Allocated Metric');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used CPU Cores');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'CPU Cores Used Metric');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.expect_text(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line', 'Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk I/O');
      cy.expect_text(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Disk I/O Used');
      cy.expect_text(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(2)', '10000.0');
      cy.expect_text(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '10000.0');
      cy.expect_text(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '1.0');
      cy.expect_text(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(2)', '2.0');
      cy.expect_text(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(1)', '1.0');
      cy.expect_text(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(2)', '2.0');
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains('Day / Bps');

      cy.expect_text(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 1');
      cy.expect_text(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Compute Metric 1');
      cy.expect_text(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row', '-');
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.expect_text(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Fixed Compute Cost 2');
      cy.expect_text(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Fixed Compute Metric 2');
      cy.expect_text(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(7) > :nth-child(6) > .cell > .array_list > .list_row', '-');
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.expect_text(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Memory');
      cy.expect_text(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Allocated over Time Period');
      cy.expect_text(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.expect_text(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line', 'Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Memory');
      cy.expect_text(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Memory Used');
      cy.expect_text(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row', '0.02');
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.expect_text(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line', 'Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Network I/O');
      cy.expect_text(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Network I/O Used');
      cy.expect_text(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row', '0.5');
      cy.expect_text(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / KBps');
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

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 1');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'Fixed Storage 1 Metric');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '50.0');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '100.0');
      cy.expect_text(':nth-child(3) > .cell > .array_list > :nth-child(2)', '50.0');
      cy.expect_text(':nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(5) > .cell > .array_list > :nth-child(2)', '75.0');
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Week');

      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 2');
      cy.expect_text(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'Fixed Storage 2 Metric');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Disk Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Allocated');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Year / MB');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Used');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '10000.0');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > :nth-child(1)', '2.0');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(2)', '10000.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / GB');
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

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 1');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'Fixed Storage 1 Metric');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(1)', 'Infinity');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '100.0');
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Day');

      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 2');
      cy.expect_text(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'Fixed Storage 2 Metric');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '1.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '100.0');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(2)', '100.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(2)', '0.0');
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Disk Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Allocated');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '100.0');
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Month / KB');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Used');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(1)', '10000.0');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > :nth-child(1)', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > :nth-child(1)', '2.0');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(2)', '10000.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(2)', 'Infinity');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > :nth-child(2)', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > :nth-child(2)', '0.0');
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / GB');
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

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.expect_text(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 1');
      cy.expect_text(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'Fixed Storage 1 Metric');
      cy.expect_text(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row', '-');
      cy.expect_text(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(1)', 'Fixed Storage Cost 2');
      cy.expect_text(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line', 'Fixed');
      cy.expect_text(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(2)', 'Fixed Storage 2 Metric');
      cy.expect_text(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row', '-');
      cy.expect_text(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour');

      cy.expect_text(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Allocated Disk Storage');
      cy.expect_text(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Allocated');
      cy.expect_text(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row', '1.0');
      cy.expect_text(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / GB');

      cy.expect_text(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line', 'Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)', 'Used Disk Storage');
      cy.expect_text(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)', 'Storage Used');
      cy.expect_text(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row', 'Infinity');
      cy.expect_text(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row', '0.0');
      cy.expect_text(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row', '2.0');
      cy.expect_text(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line', '$ [United States Dollar] / Hour / GB');

      cy.toolbar('Configuration', 'Remove from the VMDB');
      cy.gtlGetRows([1]).then((rows) => {
        rows.forEach((row) => {
          expect(row).to.not.eq('copy of default');
        });
      });
    });
  });
});
