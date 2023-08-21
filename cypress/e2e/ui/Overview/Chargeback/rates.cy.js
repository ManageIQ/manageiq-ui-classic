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
    cy.get('.clickable-row').then((rows) => {
      const nums = [...Array(rows.length).keys()];
      nums.forEach((index) => {
        if (rows[index].children[1].innerText === 'Default' && rows[index].children[2].innerText === 'Compute') {
          cy.get(rows[index]).click();
        }
      });
    }).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.get(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Count');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('vCPUs Allocated over Time Period');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / Cpu');
      });

      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Used');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / MHz');
      });

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Allocated Metric');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / Cpu core');
      });

      cy.get(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Used Metric');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / Cpu core');
      });

      cy.get(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O Used');
      });
      cy.get(':nth-child(5) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(5) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(5) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(5) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.005');
      });
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / KBps');
      });

      cy.get(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 1');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 1');
      });
      cy.get(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });

      cy.get(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 2');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 2');
      });
      cy.get(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });

      cy.get(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Allocated over Time Period');
      });
      cy.get(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / MB');
      });

      cy.get(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Used');
      });
      cy.get(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / MB');
      });

      cy.get(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O Used');
      });
      cy.get(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.5');
      });
      cy.get(':nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.5');
      });
      cy.get(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.005');
      });
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / KBps');
      });
    });
  });

  it('Loads the default storage chargeback rate', () => {
    cy.get('.clickable-row').then((rows) => {
      const nums = [...Array(rows.length).keys()];
      nums.forEach((index) => {
        if (rows[index].children[1].innerText === 'Default' && rows[index].children[2].innerText === 'Storage') {
          cy.get(rows[index]).click();
        }
      });
    }).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Storage');

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.get(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 1');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 1 Metric');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });

      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 2');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 2 Metric');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Disk Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Allocated');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / GB');
      });

      cy.get(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Used');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / GB');
      });
    });
  });

  it('Loads the default container image chargeback rate', () => {
    cy.get('.clickable-row').then((rows) => {
      const nums = [...Array(rows.length).keys()];
      nums.forEach((index) => {
        if (rows[index].children[1].innerText === 'Default Container Image Rate') {
          cy.get(rows[index]).click();
        }
      });
    }).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Default Container Image Rate');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.get(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Count');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('vCPUs Allocated over Time Period');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / Cpu');
      });

      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Used');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / MHz');
      });

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Allocated Metric');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / Cpu core');
      });

      cy.get(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Used Metric');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / Cpu core');
      });

      cy.get(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O Used');
      });
      cy.get(':nth-child(5) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(5) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(5) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(5) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.005');
      });
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / KBps');
      });

      cy.get(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 1');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 1');
      });
      cy.get(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });

      cy.get(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 2');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 2');
      });
      cy.get(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });

      cy.get(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Allocated over Time Period');
      });
      cy.get(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / MB');
      });

      cy.get(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Used');
      });
      cy.get(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / MB');
      });

      cy.get(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O Used');
      });
      cy.get(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.5');
      });
      cy.get(':nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.5');
      });
      cy.get(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.005');
      });
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / KBps');
      });
    });
  });

  it('Cancel button works on the form', () => {
    const rates = [];
    cy.get('.clickable-row').then((rows) => {
      const nums = [...Array(rows.length).keys()];
      nums.forEach((index) => {
        rates.push(rows[index].children[1].innerText);
      });
    }).then(() => {
      cy.get('#chargeback_rates_vmdb_choice').click();
      cy.get(':nth-child(1) > .bx--overflow-menu-options__btn > div').click();
      cy.get('[width="100%"] > tbody > tr > td > .btn-default').click();
      cy.get('.miq-toolbar-group');
      cy.url().should('eq', 'http://localhost:3000/chargeback_rate/show_list?flash_msg=Add+of+new+Chargeback+Rate+was+cancelled+by+the+user#/');
      cy.get('.alert').contains('Add of new Chargeback Rate was cancelled by the user');
      cy.get('.clickable-row').then((rows) => {
        const nums = [...Array(rows.length).keys()];
        nums.forEach((index) => {
          expect(rates).to.include(rows[index].children[1].innerText);
          rates.shift();
        });
      });
    });
  });

  it('Can add, edit and delete a compute chargeback rate', () => {
    let currency = '';
    cy.get('#chargeback_rates_vmdb_choice').click();
    cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();
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
    cy.get('.clickable-row').then((rows) => {
      const nums = [...Array(rows.length).keys()];
      nums.forEach((index) => {
        if (rows[index].children[1].innerText === 'Cypress test compute chargeback rates') {
          cy.get(rows[index]).click();
        }
      });
    }).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Cypress test compute chargeback rates');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Compute');

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.get(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Count');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('vCPUs Allocated over Time Period');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu');

      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Used');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('50.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('50.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('75.0');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(6) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('5.0');
      });
      cy.get(':nth-child(2) > :nth-child(6) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('10.0');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Week / KHz');

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Allocated Metric');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.get(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Used Metric');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.get(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O Used');
      });
      cy.get(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains('Day / MBps');

      cy.get(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 1');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 1');
      });
      cy.get(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('-');
      });
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.get(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 2');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 2');
      });
      cy.get(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('-');
      });
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.get(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Allocated over Time Period');
      });
      cy.get(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.get(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Used');
      });
      cy.get(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.get(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O Used');
      });
      cy.get(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.5');
      });
      cy.get(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / KBps');
    }).then(() => {
      cy.get('#chargeback_rate_vmdb_choice').click();
      cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();
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

      cy.get(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Count');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('vCPUs Allocated over Time Period');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('10.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('10.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('10.0');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Day / Cpu');

      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU');
      });
      cy.get(':nth-child(2) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Used');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('75.0');
      });
      cy.get(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('5.0');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Week / KHz');

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated CPU Cores');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Allocated Metric');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.get(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used CPU Cores');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('CPU Cores Used Metric');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / Cpu core');

      cy.get(':nth-child(5) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk I/O');
      });
      cy.get(':nth-child(5) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Disk I/O Used');
      });
      cy.get(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(5) > :nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(5) > :nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(5) > :nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(5) > :nth-child(6) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(5) > :nth-child(7) > .cell > .bx--front-line').contains('Day / Bps');

      cy.get(':nth-child(6) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 1');
      });
      cy.get(':nth-child(6) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 1');
      });
      cy.get(':nth-child(6) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(6) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('-');
      });
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(6) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.get(':nth-child(7) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Cost 2');
      });
      cy.get(':nth-child(7) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Compute Metric 2');
      });
      cy.get(':nth-child(7) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(7) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(7) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(6) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('-');
      });
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(7) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.get(':nth-child(8) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Memory');
      });
      cy.get(':nth-child(8) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Allocated over Time Period');
      });
      cy.get(':nth-child(8) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(8) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(8) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.get(':nth-child(9) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Memory');
      });
      cy.get(':nth-child(9) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Memory Used');
      });
      cy.get(':nth-child(9) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(9) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(9) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.02');
      });
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(9) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / MB');

      cy.get(':nth-child(10) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Network I/O');
      });
      cy.get(':nth-child(10) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Network I/O Used');
      });
      cy.get(':nth-child(10) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(10) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(10) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.5');
      });
      cy.get(':nth-child(10) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(10) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / KBps');
    }).then(() => {
      cy.get('#chargeback_rate_vmdb_choice').click();
      cy.get(':nth-child(3) > .bx--overflow-menu-options__btn').click();
      cy.get('.clickable-row').then((rows) => {
        const nums = [...Array(rows.length).keys()];
        nums.forEach((index) => {
          expect(rows[index].children[1].innerText).to.not.eq('Cypress test compute chargeback rates edit');
          expect(rows[index].children[1].innerText).to.not.eq('Cypress test compute chargeback rates');
        });
      });
    });
  });

  it('Can add, edit and delete a storage chargeback rate', () => {
    let currency = '';
    cy.intercept('POST', '/chargeback_rate/form_field_changed/new?rate_type=Storage').as('fieldChange');
    cy.get('#chargeback_rates_vmdb_choice').click();
    cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();
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
    cy.get('.clickable-row').then((rows) => {
      const nums = [...Array(rows.length).keys()];
      nums.forEach((index) => {
        if (rows[index].children[1].innerText === 'Cypress test storage chargeback rates') {
          cy.get(rows[index]).click();
        }
      });
    }).then(() => {
      cy.get(':nth-child(1) > .col-md-8 > .form-control-static').contains('Cypress test storage chargeback rates');
      cy.get(':nth-child(2) > .col-md-8 > .form-control-static').contains('Storage');

      cy.get('thead > tr > :nth-child(1)').contains('Group');
      cy.get('thead > tr > :nth-child(2)').contains('Description (Column Name in Report)');
      cy.get('thead > tr > :nth-child(3)').contains('Range Start');
      cy.get('thead > tr > :nth-child(4)').contains('Range Finish');
      cy.get('thead > tr > :nth-child(5)').contains('Rate Fixed');
      cy.get('thead > tr > :nth-child(6)').contains('Rate Variable');
      cy.get('thead > tr > :nth-child(7)').contains('Units');

      cy.get(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 1');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 1 Metric');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('50.0');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('50.0');
      });
      cy.get(':nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('75.0');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Week');

      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 2');
      });
      cy.get(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 2 Metric');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Disk Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Allocated');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Year / MB');

      cy.get(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Used');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / GB');
    }).then(() => {
      cy.get('#chargeback_rate_vmdb_choice').click();
      cy.get(':nth-child(1) > .bx--overflow-menu-options__btn').click();
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

      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 1');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 1 Metric');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').contains('Day');

      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 2');
      });
      cy.get(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 2 Metric');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').contains('Hour');

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Disk Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Allocated');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('100.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').contains('Month / KB');

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Used');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('10000.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains(currency);
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').contains('Hour / GB');
    }).then(() => {
      cy.get('#chargeback_rate_vmdb_choice').click();
      cy.get(':nth-child(3) > .bx--overflow-menu-options__btn').click();
      cy.get('.clickable-row').then((rows) => {
        const nums = [...Array(rows.length).keys()];
        nums.forEach((index) => {
          expect(rows[index].children[1].innerText).to.not.eq('Cypress test storage chargeback rates edit');
          expect(rows[index].children[1].innerText).to.not.eq('Cypress test storage chargeback rates');
        });
      });
    });
  });

  it('Copy a chargeback rate', () => {
    cy.get('.clickable-row').then((rows) => {
      const nums = [...Array(rows.length).keys()];
      nums.forEach((index) => {
        if (rows[index].children[1].innerText === 'Default' && rows[index].children[2].innerText === 'Storage') {
          cy.get(rows[index]).click();
        }
      });
      cy.get('#chargeback_rate_vmdb_choice').click();
      cy.get(':nth-child(2) > .bx--overflow-menu-options__btn').click();
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

      cy.get(':nth-child(1) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 1');
      });
      cy.get(':nth-child(1) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 1 Metric');
      });
      cy.get(':nth-child(1) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(1) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(1) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('-');
      });
      cy.get(':nth-child(1) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });
      cy.get(':nth-child(2) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Fixed');
      });
      cy.get(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage Cost 2');
      });
      cy.get(':nth-child(2) > .vertical_align_top > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Fixed Storage 2 Metric');
      });
      cy.get(':nth-child(2) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(2) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(2) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('-');
      });
      cy.get(':nth-child(2) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour');
      });

      cy.get(':nth-child(3) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Allocated Disk Storage');
      });
      cy.get(':nth-child(3) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Allocated');
      });
      cy.get(':nth-child(3) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(3) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('1.0');
      });
      cy.get(':nth-child(3) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(3) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / GB');
      });

      cy.get(':nth-child(4) > :nth-child(1) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(1)').then((value) => {
        expect(value[0].innerText).to.eq('Used Disk Storage');
      });
      cy.get(':nth-child(4) > :nth-child(2) > .cell > .array_list > :nth-child(2)').then((value) => {
        expect(value[0].innerText).to.eq('Storage Used');
      });
      cy.get(':nth-child(4) > :nth-child(3) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(4) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('Infinity');
      });
      cy.get(':nth-child(4) > :nth-child(5) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('0.0');
      });
      cy.get(':nth-child(4) > :nth-child(6) > .cell > .array_list > .list_row').then((value) => {
        expect(value[0].innerText).to.eq('2.0');
      });
      cy.get(':nth-child(4) > :nth-child(7) > .cell > .bx--front-line').then((value) => {
        expect(value[0].innerText).to.eq('$ [United States Dollar] / Hour / GB');
      });

      cy.get('#chargeback_rate_vmdb_choice').click();
      cy.get(':nth-child(3) > .bx--overflow-menu-options__btn').click();
      cy.get('.clickable-row').then((rows) => {
        const nums = [...Array(rows.length).keys()];
        nums.forEach((index) => {
          expect(rows[index].children[1].innerText).to.not.eq('copy of default');
        });
      });
    });
  });
});
