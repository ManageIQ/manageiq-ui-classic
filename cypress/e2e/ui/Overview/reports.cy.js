/* eslint-disable no-undef */

describe('Overview > Reports Tests', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Reports');
  });

  it('Report page loads correctly', () => {
    cy.expect_show_list_title('All Saved Reports');
  });

  it('Can add, edit and delete a report', () => {
    cy.get('#control_reports_accord > .panel-title > .collapsed').click(); // Navigate to reports section of explorer page

    // Click add report
    cy.get('#report_vmdb_choice').click().then(() => {
      cy.get('.bx--overflow-menu-options__btn').then((list) => {
        cy.get(list.children()[0]).click();
      });
    });
    // Fill out report information
    cy.get('#name').type('Cypress Test Report', { force: true });
    cy.get('#title').type('Cypress test report title', { force: true });

    let basedOn = '';
    let columns = [];
    let tableName = '';
    cy.get(':nth-child(4) > .col-md-8 > .btn-group > .btn').click({force: true});
    cy.get(':nth-child(4) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
      cy.get(option).click({ force: true });
      basedOn = option[0].innerText;
      tableName = basedOn.substring(0, basedOn.length - 1).replace(' ', '');
    });
    cy.get('[align="left"] > .btn-group > .btn').click({ force: true });
    cy.get('[align="left"] > .btn-group > .open > .dropdown-menu > [data-original-index="0"] > a > .text').then((option) => {
      cy.get(option).click({ force: true });
      columns.push(option[0].innerText.trim());
    });
    cy.get('[align="left"] > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a > .text').then((option) => {
      cy.get(option).click({ force: true });
      columns.push(option[0].innerText.trim());
    });
    cy.get('[align="left"] > .btn-group > .btn > .filter-option').click({ force: true});
    cy.intercept('/report/form_field_changed/new?button=right').as('fieldsChanged');
    cy.get('[alt="Move selected fields down"]').click({force: true});
    cy.wait('@fieldsChanged').then(() => {
    // Verify all report page tabs load correctly
      cy.get('#Consolidation_tab > a').click({ force: true });
      cy.get('#consolidate_div > h3').contains('Group Records by up to 3 Columns');
      cy.get('#Formatting_tab > a').click({ force: true });
      cy.get('#formatting_div > h3').contains('PDF Output');
      cy.get('#Styling_tab > a').click({ force: true });
      cy.get('#styling_div > h3').contains('Specify Column Styles');
      cy.get('#Filter_tab > a').click({ force: true });
      cy.get('#filter_div > h3').contains(`Primary (Record) Filter - Filters the ${tableName} table records`);
    });

    // Set chart type and make sure chart loads correctly
    let sortBy = '';
    let chartType = '';
    cy.get('#Summary_tab > a').click({ force: true });
    cy.get('#sort_div').get('.btn-group > .btn').click({ force: true });
    cy.get('[data-original-index="1"] > a').then((option) => {
      cy.get(option).click({ force: true });
      sortBy = option[0].innerText;
    });
    cy.get('#Charts_tab > a').click({ force: true });
    cy.get('#chart_div').get('.btn-group > .btn').click({ force: true });
    cy.get('[data-original-index="1"] > a').then((option) => {
      cy.get(option).click({ force: true });
      chartType = option[0].innerText;
    });
    cy.get('#chart_sample_div > fieldset');

    // Load report preview and verify column values
    cy.get('#Preview_tab > a').click({ force: true });
    cy.get('#form_preview > h3').get('a > .fa').click({ force: true });
    cy.get('#form_preview').get('h3').contains('Chart Preview (up to 50 rows)');
    cy.get('#form_preview').get('h3').contains('Report Preview (up to 50 rows)');
    cy.get('#form_preview').get('th').then((result) => {
      expect(result[0].innerText).to.eq(columns[0]);
      expect(result[1].innerText).to.eq(columns[1]);
    });

    cy.get('#buttons_on > .btn-primary').click({ force: true }); // Click Add button

    // Navigate to the report that was just added
    cy.expect_show_list_title('All Reports');
    cy.get('.clickable-row').contains('My Company').click();
    cy.expect_show_list_title('My Company (All Groups) Reports');
    cy.get('.clickable-row').contains('Custom').click({ force: true });
    cy.expect_show_list_title('Custom Reports');
    cy.get('.list-group-item').contains('Cypress Test Report').click();

    // Verify report was added with correct values on summary page
    let tableHeaders = [];
    let tableValues = [];
    let id;
    cy.get('.label_header').then((headers) => {
      const nums = [...Array(headers.length).keys()];
      nums.forEach((index) => {
        tableHeaders.push(headers[index].innerText);
      });
    }).then(() => {
      expect(tableHeaders[0]).to.eq('ID');
      expect(tableHeaders[1]).to.eq('Title');
      expect(tableHeaders[2]).to.eq('Sort By');
      expect(tableHeaders[3]).to.eq('Chart');
      expect(tableHeaders[4]).to.eq('Based On');
      expect(tableHeaders[5]).to.eq('User');
      expect(tableHeaders[6]).to.eq('EVM Group');
      expect(tableHeaders[7]).to.eq('Updated On');
    });
    cy.get('.content_value').then((values) => {
      const nums = [...Array(values.length).keys()];
      id = values[0].innerText;
      nums.forEach((index) => {
        tableValues.push(values[index].innerText);
      });
    }).then(() => {
      expect(tableValues[1]).to.eq('Cypress test report title');
      expect(tableValues[2]).to.eq(sortBy);
      expect(chartType).to.include(tableValues[3]);
      expect(basedOn).to.include(tableValues[4]);
      expect(tableValues[5]).to.eq('admin');
    }).then(() => {
      // Click edit report
      cy.get('#report_vmdb_choice').click().then(() => {
        cy.get('.bx--overflow-menu-options__btn').then((list) => {
          cy.get(list.children()[1]).click();
        });
      });
      // Edit report information
      cy.get('#name').clear({ force: true }).type('Cypress Test Report Edit', { force: true });
      cy.get('#title').clear({ force: true }).type('Cypress test report title edit', { force: true });

      cy.get('[align="left"] > .btn-group > .btn').click({ force: true });
      cy.get('[align="left"] > .btn-group > .open > .dropdown-menu > [data-original-index="24"] > a').then((option) => {
        cy.get(option).click({ force: true });
        columns.push(option[0].innerText.trim());
      });
      cy.get('[align="left"] > .btn-group > .btn > .filter-option').click({ force: true });
      cy.intercept(`/report/form_field_changed/${id}?button=right`).as('fieldsChanged');
      cy.get('.text-center > [alt="Move selected fields down"]').click({force: true});
      cy.wait('@fieldsChanged');

      // Verify all report page tabs load correctly
      cy.get('#Consolidation_tab > a').click({ force: true });
      cy.get('#consolidate_div > h3').contains('Group Records by up to 3 Columns');
      cy.get('#Formatting_tab > a').click({ force: true });
      cy.get('#formatting_div > h3').contains('PDF Output');
      cy.get('#Styling_tab > a').click({ force: true });
      cy.get('#styling_div > h3').contains('Specify Column Styles');
      cy.get('#Filter_tab > a').click({ force: true });
      cy.get('#filter_div > h3').contains(`Primary (Record) Filter - Filters the ${tableName} table records`);

      // Edit report chart values and verify chart and report are correctly created
      sortBy = '';
      chartType = '';
      cy.get('#Summary_tab > a').click({ force: true });
      cy.get(':nth-child(2) > :nth-child(1) > .col-md-8 > .btn-group > .btn').click({ force: true });
      cy.get(':nth-child(1) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="3"] > a').then((option) => {
        cy.get(option).click({ force: true });
        sortBy = option[0].innerText;
      });
      cy.get('#Charts_tab > a').click({ force: true });
      cy.get('#chart_div').get(':nth-child(1) > .col-md-8 > .btn-group > .btn').click({ force: true });
      cy.get(':nth-child(1) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="3"] > a').then((option) => {
        cy.get(option).click({ force: true });
        chartType = option[0].innerText;
      });
      cy.get('#chart_sample_div > fieldset');

      cy.get('#Preview_tab > a').click({ force: true });
      cy.get('#form_preview > h3').get('a > .fa').click({ force: true });
      cy.get('#form_preview').get('h3').contains('Chart Preview (up to 50 rows)');
      cy.get('#form_preview').get('h3').contains('Report Preview (up to 50 rows)');
      cy.get('#form_preview').get('th').then((result) => {
        expect(result[0].innerText).to.eq(columns[0]);
        expect(result[1].innerText).to.eq(columns[1]);
        expect(result[2].innerText).to.eq(columns[2]);
      });
      cy.get('#buttons_on > .btn-primary').click({ force: true }); // Click save button
    }).then(() => {
      // Verify report was edited with correct values on summary page
      tableHeaders = [];
      tableValues = [];
      cy.get('.list-group-item').contains('Cypress Test Report Edit').click();
      cy.get('.label_header').then((headers) => {
        const nums = [...Array(headers.length).keys()];
        nums.forEach((index) => {
          tableHeaders.push(headers[index].innerText);
        });
      }).then(() => {
        expect(tableHeaders[0]).to.eq('ID');
        expect(tableHeaders[1]).to.eq('Title');
        expect(tableHeaders[2]).to.eq('Sort By');
        expect(tableHeaders[3]).to.eq('Chart');
        expect(tableHeaders[4]).to.eq('Based On');
        expect(tableHeaders[5]).to.eq('User');
        expect(tableHeaders[6]).to.eq('EVM Group');
        expect(tableHeaders[7]).to.eq('Updated On');
      });

      cy.get('.content_value').then((values) => {
        const nums = [...Array(values.length).keys()];
        id = values[0].innerText;
        nums.forEach((index) => {
          tableValues.push(values[index].innerText);
        });
      }).then(() => {
        expect(tableValues[0]).to.eq(`${id}`);
        expect(tableValues[1]).to.eq('Cypress test report title edit');
        expect(tableValues[2]).to.eq(sortBy);
        expect(chartType).to.include(tableValues[3]);
        expect(basedOn).to.include(tableValues[4]);
        expect(tableValues[5]).to.eq('admin');
      });

      // Delete report and verify that it was deleted
      cy.intercept(`/report/x_button/${id}?pressed=miq_report_delete`).as('delete');
      cy.get('#report_vmdb_choice').click().then(() => {
        cy.get('.bx--overflow-menu-options__btn').then((list) => {
          cy.get(list.children()[4]).click();
        });
      });
      cy.wait('@delete');
      cy.get('.list-group-item').should('not.contain', 'Cypress Test Report Edit');
    });
  });

  it('Can add, edit and delete a schedule', () => {
    cy.get('#control_schedules_accord > .panel-title > .collapsed').click({ force: true });

    // Click add schedule
    cy.get('#miq_schedule_vmdb_choice').click().then(() => {
      cy.get('.bx--overflow-menu-options__btn').then((list) => {
        cy.get(list.children()[0]).click();
      });
    });
    // Fill out schedule information
    cy.get('#name').type('Cypress Test Schedule', { force: true });
    cy.get('#description').type('Cypress test schedule description', { force: true });

    let reportFilter = '';
    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .btn').click({ force: true });
    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="5"] > a').then((option) => {
      cy.get(option).click({ force: true }).then(() => {
        cy.get('#form_filter_div > .form-horizontal > :nth-child(2) > .col-md-8 > .btn-group > .btn').click({ force: true });
        cy.get('#form_filter_div > .form-horizontal > :nth-child(2) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
          cy.get(option).click({ force: true }).then(() => {
            cy.get(':nth-child(3) > .col-md-8 > .btn-group > .btn').click({ force: true });
            cy.get(':nth-child(3) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
              cy.get(option).click({ force: true });
              reportFilter = option[0].innerText;
            });
          });
        });
      });
    });

    // Select time for schedule
    let runTiming = '';
    let runHour = '';
    let runMinute = '';
    cy.get('#form_timer_div > .form-horizontal > :nth-child(1) > .col-md-8 > :nth-child(1) > .btn').click({ force: true });
    cy.get('.btn-group.open > .open > .dropdown-menu > [data-original-index="2"] > a').then((option) => {
      cy.get(option).click({ force: true });
      runTiming = option[0].innerText;
    });
    cy.get(':nth-child(4) > .col-md-8 > :nth-child(1) > .btn').click({ force: true });
    cy.get('.btn-group.open > .open > .dropdown-menu > [data-original-index="4"] > a').then((option) => {
      cy.get(option).click({ force: true });
      runHour = option[0].innerText;
    });
    cy.get(':nth-child(3) > .btn').click({ force: true });
    cy.get('.btn-group.open > .open > .dropdown-menu > [data-original-index="10"] > a').then((option) => {
      cy.get(option).click({ force: true });
      runMinute = option[0].innerText;
    });

    // Click add schedule
    cy.get('#buttons_on > .btn-primary').click({ force: true});

    // Load schedule preview and verify values
    let tableHeaders = [];
    let tableValues = [];
    cy.get('.list-group-item').contains('Cypress Test Schedule').click();
    cy.get('.label_header').then((headers) => {
      const nums = [...Array(headers.length).keys()];
      nums.forEach((index) => {
        tableHeaders.push(headers[index].innerText);
      });
    }).then(() => {
      expect(tableHeaders[0]).to.eq('Description');
      expect(tableHeaders[1]).to.eq('Active');
      expect(tableHeaders[2]).to.eq('E-Mail after Running');
      expect(tableHeaders[3]).to.eq('To E-mail');
      expect(tableHeaders[4]).to.eq('Report Filter');
      expect(tableHeaders[5]).to.eq('Run At');
      expect(tableHeaders[6]).to.eq('Last Run Time');
      expect(tableHeaders[7]).to.eq('Next Run Time');
      expect(tableHeaders[8]).to.eq('Zone');
    });
    cy.get('.content_value').then((values) => {
      const nums = [...Array(values.length).keys()];
      nums.forEach((index) => {
        tableValues.push(values[index].innerText);
      });
    }).then(() => {
      expect(tableValues[0]).to.eq('Cypress test schedule description');
      expect(tableValues[1]).to.eq('True');
      expect(tableValues[2]).to.eq('False');
      expect(tableValues[3]).to.eq('');
      expect(tableValues[4]).to.eq(reportFilter);
      expect(tableValues[5]).to.contain(`${runHour}:${runMinute}:00`);
      expect(tableValues[7]).to.contain(`${runHour}:${runMinute}:00`);
      expect(tableValues[8]).to.eq('default');
    });

    // Click edit schedule
    cy.get('#miq_schedule_vmdb_choice').click().then(() => {
      cy.get('.bx--overflow-menu-options__btn').then((list) => {
        cy.get(list.children()[0]).click();
      });
    });

    // Edit the schedule information
    reportFilter = '';
    cy.get('#name').clear({ force: true }).type('Cypress Test Schedule Edit', { force: true });
    cy.get('#description').clear({ force: true }).type('Cypress test schedule description edit', { force: true });

    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .btn').click({ force: true });
    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="0"] > a').click({ force: true });

    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .btn').click({ force: true });
    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
      cy.get(option).click({ force: true }).then(() => {
        cy.wait(5000);
        cy.get('#form_filter_div > .form-horizontal > :nth-child(2) > .col-md-8 > .btn-group > .btn').click({ force: true });
        cy.get('#form_filter_div > .form-horizontal > :nth-child(2) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
          cy.get(option).click({ force: true }).then(() => {
            cy.wait(5000);
            cy.get(':nth-child(3) > .col-md-8 > .btn-group > .btn').click({ force: true });
            cy.get(':nth-child(3) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
              cy.get(option).click({ force: true });
              reportFilter = option[0].innerText;
            });
          });
        });
      });
    });

    // Edit the schedule time
    runTiming = '';
    runHour = '';
    runMinute = '';
    cy.get('#form_timer_div > .form-horizontal > :nth-child(1) > .col-md-8 > :nth-child(1) > .btn').click({ force: true });
    cy.get('.btn-group.open > .open > .dropdown-menu > [data-original-index="0"] > a').then((option) => {
      cy.get(option).click({ force: true });
      runTiming = option[0].innerText;
    });
    cy.get(':nth-child(4) > .col-md-8 > :nth-child(1) > .btn').click({ force: true });
    cy.get('.btn-group.open > .open > .dropdown-menu > [data-original-index="0"] > a').then((option) => {
      cy.get(option).click({ force: true });
      runHour = option[0].innerText;
    });
    cy.get(':nth-child(3) > .btn').click({ force: true });
    cy.get('.btn-group.open > .open > .dropdown-menu > [data-original-index="6"] > a').then((option) => {
      cy.get(option).click({ force: true });
      runMinute = option[0].innerText;
    });

    // Add a from and to email for the schedule
    cy.get('#send_email_cb').click({ force: true });
    cy.get('#from').type('cfadmin@cfserver.com', { force: true });
    cy.get('#email').type('cfadmin@cfserver.com', { force: true });
    cy.get('.input-group-btn > .btn').click({ force: true });

    // Click save button
    cy.get('#edit_to_email_div > .form-horizontal > :nth-child(1) > .col-md-8').contains('cfadmin@cfserver.com');
    cy.get('#buttons_on > .btn-primary').click({ force: true }).then(() => {
      // Load schedule and verify it was edited with correct values on summary page
      tableHeaders = [];
      tableValues = [];
      cy.get('.list-group-item').contains('Cypress Test Schedule').click();
      cy.get('.label_header').then((headers) => {
        const nums = [...Array(headers.length).keys()];
        nums.forEach((index) => {
          tableHeaders.push(headers[index].innerText);
        });
      }).then(() => {
        expect(tableHeaders[0]).to.eq('Description');
        expect(tableHeaders[1]).to.eq('Active');
        expect(tableHeaders[2]).to.eq('E-Mail after Running');
        expect(tableHeaders[3]).to.eq('From E-mail');
        expect(tableHeaders[4]).to.eq('To E-mail');
        expect(tableHeaders[5]).to.eq('Report Filter');
        expect(tableHeaders[6]).to.eq('Run At');
        expect(tableHeaders[7]).to.eq('Last Run Time');
        expect(tableHeaders[8]).to.eq('Next Run Time');
        expect(tableHeaders[9]).to.eq('Zone');
      });

      cy.get('.content_value').then((values) => {
        const nums = [...Array(values.length).keys()];
        nums.forEach((index) => {
          tableValues.push(values[index].innerText);
        });
      }).then(() => {
        expect(tableValues[0]).to.eq('Cypress test schedule description edit');
        expect(tableValues[1]).to.eq('True');
        expect(tableValues[2]).to.eq('True');
        expect(tableValues[3]).to.eq('cfadmin@cfserver.com');
        expect(tableValues[4]).to.eq('cfadmin@cfserver.com');
        expect(tableValues[5]).to.eq(reportFilter);
        expect(tableValues[6]).to.contain(`Run ${runTiming.toLowerCase()}`);
        expect(tableValues[6]).to.contain(`${runHour}:${runMinute}:00`);
        expect(tableValues[8]).to.contain(`${runHour}:${runMinute}:00`);
        expect(tableValues[9]).to.eq('default');
      });

      // Delete the schedule
      cy.get('#miq_schedule_vmdb_choice').click().then(() => {
        cy.get('.bx--overflow-menu-options__btn').then((list) => {
          cy.get(list.children()[1]).click();
        });
      });
    });
  });
});
