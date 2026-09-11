import { flashClassMap } from '../../../support/assertions/assertion_constants';

describe('Overview > Reports Tests', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Reports');
  });

  it('Report page loads correctly', () => {
    cy.expect_show_list_title('All Saved Reports');
  });

  context('With cleanup of saved reports', () => {
    afterEach(() => {
      cy.appDbState('restore');
    });

    it('Can add, edit and delete a report', () => {
      cy.accordion('Reports');
      cy.expect_explorer_title('All Reports');

      cy.intercept('GET', '/report/react_form_data/new').as('formData');
      cy.intercept('GET', '/report/react_available_fields*').as('availableFields');
      cy.intercept('GET', '/expression_editor/metadata*').as('expressionMeta');
      cy.intercept('POST', '/report/react_save/new').as('saveReport');

      cy.toolbar('Configuration', 'Add a new Report');
      cy.wait('@formData');
      cy.get('.report-editor').should('be.visible');

      // All 6 tabs present before a model is chosen
      ['Columns', 'Filter', 'Summary', 'Charts', 'Styling', 'Preview'].forEach((tab) => {
        cy.contains('[role="tab"]', tab).scrollIntoView().should('be.visible');
      });

      // ── Columns tab ────────────────────────────────────────────────────────
      cy.get('#name').clear().type('Cypress React Report');
      cy.get('#title').clear().type('Cypress React Report Title');

      // Report creation timeout — pick a non-default value if available
      cy.get('#queue_timeout option').then(($opts) => {
        if ($opts.length > 1) cy.get('#queue_timeout').select($opts[1].value);
      });

      // Select the first available model
      let selectedModel = '';
      cy.get('#model option:not([value=""])').first().then(($opt) => {
        selectedModel = $opt.val();
        cy.get('#model').select(selectedModel);
      });
      cy.wait('@availableFields');

      // Pick two fields so Summary/Charts/Styling have something to work with
      cy.get('#report-field-picker').closest('.cds--multi-select').find('.cds--list-box__field').click();
      cy.get('.cds--list-box__menu-item').first().click();
      cy.get('.cds--list-box__menu-item').eq(1).then(($item) => {
        // select a second field if one exists
        if ($item.length) cy.wrap($item).click();
      });
      cy.get('#report-field-picker').closest('.cds--multi-select').find('.cds--list-box__field').click();

      cy.get('.sortable-list-item').should('have.length.at.least', 1);
      cy.contains('Column headers and formatting').should('be.visible');

      // Formatting table — edit the Header of the first column; check Format dropdown
      cy.get('.report-editor-formatting-table table tbody tr').first().within(() => {
        // Header cell (col 1) — type a custom header
        cy.get('td').eq(1).find('input').then(($input) => {
          if ($input.length) cy.wrap($input).clear().type('Custom Header');
        });
        // Format cell (col 2) — if formats available, set to <None>
        cy.get('td').eq(2).then(($cell) => {
          if ($cell.find('select').length) {
            cy.wrap($cell).find('select option[value="_none_"]').should('exist');
            cy.wrap($cell).find('select option[value=""]').should('exist');
            cy.wrap($cell).find('select').select('_none_');
          }
        });
      });

      // PDF page size — select a non-default if shown
      cy.get('body').then(($body) => {
        if ($body.find('#pdf_page_size').length) {
          cy.get('#pdf_page_size option').then(($opts) => {
            if ($opts.length > 1) cy.get('#pdf_page_size').select($opts[$opts.length - 1].value);
          });
        }
      });

      // ── Filter tab ─────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Filter').scrollIntoView().click();
      cy.wait('@expressionMeta');
      cy.contains('Record Filter').should('be.visible');
      cy.contains('Display Filter').should('be.visible');

      // Build a complete Record Filter rule so it round-trips through save.
      // Pick the second ComboBox item (index 1) to avoid date fields which are
      // typically listed first and don't accept plain text values.
      cy.get('[id^="field-group-"]').first().should('be.visible').then(($grpSel) => {
        const fieldGroup = [...$grpSel[0].options].find((o) => o.value === 'Field' || (o.value && o.value !== '------'));
        if (!fieldGroup) return;
        cy.wrap($grpSel).select(fieldGroup.value);

        // Field ComboBox — open and pick the second item (skips any leading date field)
        cy.get('[id^="field-value-"]').first().click();
        cy.get('.cds--list-box__menu-item').then(($items) => {
          const idx = $items.length > 1 ? 1 : 0;
          cy.wrap($items[idx]).click();
        });

        // Operator is visible; leave it at default (=)
        cy.get('[id^="operator-"]').first().should('be.visible');

        // Value input — only type into plain text inputs, skip date/select editors
        cy.get('[id^="value-"]').first().should('exist').then(($val) => {
          const tag = $val[0].tagName.toLowerCase();
          const type = $val[0].type || '';
          if (tag === 'input' && type !== 'date' && !$val.hasClass('cds--date-picker__input')) {
            cy.wrap($val).clear().type('cypress-filter-test');
          }
        });
      });

      // ── Summary tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Summary').scrollIntoView().click();
      cy.contains('Sort Criteria').should('be.visible');
      cy.get('#summary-sort-1').should('exist');

      // Set a primary sort field so Charts becomes interactive
      cy.get('#summary-sort-1 option').then(($opts) => {
        const realOpt = [...$opts].find((o) => o.value && o.value !== '<<<Nothing>>>');
        if (realOpt) {
          cy.get('#summary-sort-1').select(realOpt.value);

          // Sort Order
          cy.get('#summary-order').should('be.visible').select('Descending');
          cy.get('#summary-order').should('have.value', 'Descending');

          // Show Sort Breaks = No → row limit <select> is visible (group breaks off)
          cy.get('#summary-group').should('be.visible').select('No');
          cy.get('#summary-row-limit').should('be.visible').select('100');
          cy.get('#summary-row-limit').should('have.value', '100');

          // Now switch to Yes — hides row limit, shows Hide Detail Rows toggle
          cy.get('#summary-group').select('Yes');
          cy.get('#summary-group').should('have.value', 'Yes');
          cy.get('#summary-hide-details').should('exist');
          // row-limit is replaced with plain text "All" when breaks are on
          cy.get('#summary-row-limit').should('not.exist');

          // Second sort field
          cy.get('#summary-sort-2 option').then(($opts2) => {
            const realOpt2 = [...$opts2].find((o) => o.value && o.value !== '<<<Nothing>>>' && o.value !== realOpt.value);
            if (realOpt2) cy.get('#summary-sort-2').select(realOpt2.value);
          });

          // Group Records (Consolidation) accordion — open it and set pivot column 1
          cy.contains('Group Records (Consolidation)').click();
          cy.get('#summary-pivot-1').should('be.visible');
          cy.get('#summary-pivot-1 option').then(($popts) => {
            const pivotOpt = [...$popts].find((o) => o.value && o.value !== '<<<Nothing>>>');
            if (pivotOpt) cy.get('#summary-pivot-1').select(pivotOpt.value);
          });
        }
      });

      // ── Charts tab ─────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Charts').scrollIntoView().click();
      cy.get('#chart-tile-none').should('be.visible');

      // Select the first non-"No Chart" tile
      cy.get('.report-editor-charts__tile').then(($tiles) => {
        if ($tiles.length > 1) {
          cy.wrap($tiles[1]).click();

          // Chart mode — Counts is forced when group=Counts, so just verify it's visible
          cy.get('#chart-mode').should('be.visible');

          // Top values to show
          cy.get('#chart-count').should('be.visible').select('10');
          cy.get('#chart-count').should('have.value', '10');

          // Sum Other values checkbox — Carbon hides the <input> under its wrapper,
          // so click the associated <label> instead of the input directly
          cy.get('label[for="chart-other"]').should('exist');
          cy.get('#chart-other').then(($cb) => {
            if ($cb.prop('checked')) cy.get('label[for="chart-other"]').click();
          });
        }
      });

      // ── Styling tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Styling').scrollIntoView().click();

      // One accordion item per selected column, scoped to the active tab panel.
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item')
        .should('have.length.at.least', 1);

      // Expand the first item and set a style class — StylingTab now subscribes to
      // col_options so it re-renders after formOptions.change() and the operator
      // dropdown appears reactively.
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child .cds--accordion__heading')
        .click();
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child [id^="style-class-"]')
        .first().should('be.visible')
        .select('miq_rpt_red_text');
      // Operator dropdown appears once a style class is chosen
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child [id^="style-operator-"]')
        .first().should('be.visible')
        .select('IS NULL');
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child [id^="style-operator-"]')
        .first().should('have.value', 'IS NULL');

      // ── Preview tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Preview').scrollIntoView().click();
      cy.contains('button', 'Refresh').should('be.visible').click();
      cy.get('.report-editor-preview').should('be.visible');

      // ── Save ───────────────────────────────────────────────────────────────
      cy.get('button[type="submit"]').contains('Add').click({ force: true });
      cy.wait('@saveReport').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
      });

      // Navigate to the saved report in the accordion
      cy.selectAccordionItem(
        ['All Reports', /^My Company/, 'Custom', 'Cypress React Report'],
      );
      cy.expect_explorer_title('Report "');

      // Verify the Report Info viewer shows the correct fields
      cy.get('#report_info').should('have.class', 'active');
      cy.contains('.cds--accordion__title', 'Basic Information').should('be.visible');
      cy.contains('.label_header', 'Title').should('be.visible');
      cy.contains('.label_header', 'Based On').should('be.visible');
      cy.contains('.label_header', 'User').should('be.visible');
      cy.contains('.label_header', 'Updated On').should('be.visible');
      cy.contains('Cypress React Report Title').should('be.visible');
      // Filter round-trip: report.conditions.to_human contains the value we typed.
      // The label cell may contain a longer string (e.g. model name appended) so use
      // a partial-text match; the value cell just needs the typed value to appear anywhere.
      cy.contains('.cds--structured-list-td', 'Primary (Record) Filter').should('be.visible');
      cy.contains('.cds--structured-list-td', 'cypress-filter-test').should('be.visible');

      // ── Edit ───────────────────────────────────────────────────────────────
      cy.intercept('GET', /\/report\/react_form_data\/\d+/).as('editFormData');
      cy.intercept('POST', /\/report\/react_save\/\d+/).as('saveEdit');

      cy.toolbar('Configuration', 'Edit this Report');
      cy.wait('@editFormData');
      cy.get('.report-editor').should('be.visible');

      // Verify saved values round-tripped correctly
      cy.get('#name').should('have.value', 'Cypress React Report');
      cy.get('#title').should('have.value', 'Cypress React Report Title');

      // Columns tab — verify the column we added is still selected
      cy.get('.sortable-list-item').should('have.length.at.least', 1);

      // Summary tab — verify the sort and order we set persisted
      cy.contains('[role="tab"]', 'Summary').scrollIntoView().click();
      cy.get('#summary-sort-1').then(($sel) => {
        if ($sel.val() && $sel.val() !== '<<<Nothing>>>') {
          cy.get('#summary-order').should('have.value', 'Descending');
          cy.get('#summary-group').should('have.value', 'Yes');
        }
      });

      // Make edits
      cy.contains('[role="tab"]', 'Columns').scrollIntoView().click();
      cy.get('#name').clear().type('Cypress React Report Edit');
      cy.get('#title').clear().type('Cypress React Report Title Edit');

      cy.get('button[type="submit"]').contains('Save').click({ force: true });
      cy.wait('@saveEdit').then((interception) => {
        if (interception.response.statusCode !== 200) {
          cy.log('saveEdit error body:', JSON.stringify(interception.response.body));
        }
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
      });

      // Navigate back and verify the updated name and title appear in the viewer
      cy.selectAccordionItem(
        ['All Reports', /^My Company/, 'Custom', 'Cypress React Report Edit'],
      );
      cy.expect_explorer_title('Report "');
      cy.get('#report_info').should('have.class', 'active');
      cy.contains('.cds--accordion__title', 'Basic Information').should('be.visible');
      cy.contains('Cypress React Report Title Edit').should('be.visible');

      // ── Delete ─────────────────────────────────────────────────────────────
      cy.intercept(/\/report\/x_button\/[0-9]+\?pressed=miq_report_delete/).as('deleteReport');
      cy.on('window:confirm', () => true);
      cy.toolbar('Configuration', 'Delete this Report from the Database');
      cy.wait('@deleteReport');
      cy.expect_flash(flashClassMap.success);
    });

    it('Can add a performance report', () => {
      cy.accordion('Reports');
      cy.expect_explorer_title('All Reports');

      cy.intercept('GET', '/report/react_form_data/new').as('formData');
      cy.intercept('GET', '/report/react_available_fields*').as('availableFields');
      cy.intercept('POST', '/report/react_save/new').as('saveReport');

      cy.toolbar('Configuration', 'Add a new Report');
      cy.wait('@formData');
      cy.get('.report-editor').should('be.visible');

      // ── Columns tab ────────────────────────────────────────────────────────
      cy.get('#name').clear().type('Cypress Performance Report');
      cy.get('#title').clear().type('Cypress Performance Report Title');

      // Select a performance model (ending in Performance or MetricsRollup)
      cy.get('#model option').then(($opts) => {
        const perfOpt = [...$opts].find(
          (o) => o.value && (o.value.endsWith('Performance') || o.value.endsWith('MetricsRollup'))
        );
        expect(perfOpt, 'a performance model option exists').to.exist;
        cy.get('#model').select(perfOpt.value);
      });
      cy.wait('@availableFields');

      // All 6 tabs present after selecting a performance model
      ['Columns', 'Filter', 'Summary', 'Charts', 'Styling', 'Preview'].forEach((tab) => {
        cy.contains('[role="tab"]', tab).scrollIntoView().should('be.visible');
      });

      // Performance Interval — switch to Hourly, then back to Daily
      cy.get('#perf_interval').should('be.visible').select('hourly');
      cy.get('#perf_interval').should('have.value', 'hourly');
      cy.get('#perf_interval').select('daily');

      // Averages Based On — switch to Available Active Data
      cy.get('#perf_avgs').should('be.visible').select('active_data');
      cy.get('#perf_avgs').should('have.value', 'active_data');

      // Report creation timeout — select a non-default option if available
      cy.get('#queue_timeout option').then(($opts) => {
        if ($opts.length > 1) cy.get('#queue_timeout').select($opts[1].value);
      });

      // Pick a column so the form is valid and subsequent tabs are active
      cy.get('#report-field-picker').closest('.cds--multi-select').find('.cds--list-box__field').click();
      cy.get('.cds--list-box__menu-item').first().click();
      cy.get('#report-field-picker').closest('.cds--multi-select').find('.cds--list-box__field').click();
      cy.get('.sortable-list-item').should('have.length.at.least', 1);
      cy.contains('Column headers and formatting').should('be.visible');

      // ── Filter tab ─────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Filter').scrollIntoView().click();
      cy.contains('Performance Timeframe').should('be.visible');

      // perf_end: change to "1 Day Ago" (value 1)
      cy.get('#perf_end').should('be.visible').select('1');
      cy.get('#perf_end').should('have.value', '1');

      // perf_start: change to "2 Weeks" (value 1209600 for daily)
      cy.get('#perf_start option').then(($opts) => {
        if ($opts.length > 1) cy.get('#perf_start').select($opts[$opts.length - 1].value);
      });

      // Performance filter also shows a Primary (Record) Filter expression editor
      cy.contains(/Primary \(Record\) Filter/).should('be.visible');

      // ── Summary tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Summary').scrollIntoView().click();
      cy.contains('Sort Criteria').should('be.visible');

      // Set a primary sort field (first non-Nothing option)
      cy.get('#summary-sort-1 option').then(($opts) => {
        const realOpt = [...$opts].find((o) => o.value && o.value !== '<<<Nothing>>>');
        if (realOpt) {
          cy.get('#summary-sort-1').select(realOpt.value);
          // Sort Order — set to Descending
          cy.get('#summary-order').should('be.visible').select('Descending');
          cy.get('#summary-order').should('have.value', 'Descending');

          // Show Sort Breaks — set to Yes to reveal sub-options
          cy.get('#summary-group').should('be.visible').select('Yes');
          cy.get('#summary-group').should('have.value', 'Yes');

          // Row limit only shown when group = No; when group = Yes it shows "All"
          cy.contains('Number of Rows to Show').should('be.visible');

          // Second sort — pick a different column if available
          cy.get('#summary-sort-2 option').then(($opts2) => {
            const realOpt2 = [...$opts2].find((o) => o.value && o.value !== '<<<Nothing>>>' && o.value !== realOpt.value);
            if (realOpt2) cy.get('#summary-sort-2').select(realOpt2.value);
          });
        }
      });

      // ── Charts tab ─────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Charts').scrollIntoView().click();
      cy.get('#chart-tile-none').should('be.visible');

      // Pick the first available chart type tile (skip "No Chart" at index 0)
      cy.get('.report-editor-charts__tile').then(($tiles) => {
        if ($tiles.length > 1) {
          cy.wrap($tiles[1]).click();
          // Chart mode dropdown should appear
          cy.get('#chart-mode').should('be.visible');
          // Top values to show — pick a different count
          cy.get('#chart-count').should('be.visible').select('5');
          cy.get('#chart-count').should('have.value', '5');
          // "Sum Other values" checkbox should exist
          cy.get('#chart-other').should('exist');
        }
      });

      // ── Styling tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Styling').scrollIntoView().click();
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item')
        .should('have.length.at.least', 1);

      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child .cds--accordion__heading')
        .click();
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child [id^="style-class-"]')
        .first().should('be.visible')
        .select('miq_rpt_red_text');
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child [id^="style-operator-"]')
        .first().should('be.visible')
        .select('>');
      cy.get('[role="tabpanel"]:not([hidden]) .cds--accordion__item:first-child [id^="style-operator-"]')
        .first().should('have.value', '>');

      // ── Preview tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Preview').scrollIntoView().click();
      cy.contains('button', 'Refresh').should('be.visible').click();
      // Preview either renders a table or a "no data" message — either is valid
      cy.get('.report-editor-preview').should('be.visible');

      // ── Save ───────────────────────────────────────────────────────────────
      cy.get('button[type="submit"]').contains('Add').click({ force: true });
      cy.wait('@saveReport').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
      });

      // ── Verify in accordion tree ───────────────────────────────────────────
      cy.selectAccordionItem(
        ['All Reports', /^My Company/, 'Custom', 'Cypress Performance Report'],
      );
      cy.expect_explorer_title('Report "');
      cy.get('#report_info').should('have.class', 'active');
      cy.contains('.cds--accordion__title', 'Basic Information').should('be.visible');
      cy.contains('.label_header', 'Title').should('be.visible');
      cy.contains('.label_header', 'Based On').should('be.visible');
      cy.contains('Cypress Performance Report Title').should('be.visible');
      // cleanup handled by afterEach → cy.appDbState('restore')
    });

    it('Can add a trend report', () => {
      cy.accordion('Reports');
      cy.expect_explorer_title('All Reports');

      cy.intercept('GET', '/report/react_form_data/new').as('formData');
      cy.intercept('GET', '/report/react_available_fields*').as('availableFields');
      cy.intercept('GET', '/report/react_trend_limit_cols*').as('trendLimitCols');
      cy.intercept('POST', '/report/react_save/new').as('saveReport');

      cy.toolbar('Configuration', 'Add a new Report');
      cy.wait('@formData');
      cy.get('.report-editor').should('be.visible');

      // ── Columns tab ────────────────────────────────────────────────────────
      cy.get('#name').clear().type('Cypress Trend Report');
      cy.get('#title').clear().type('Cypress Trend Report Title');

      // Select the VimPerformanceTrend model — triggers the available-fields fetch
      cy.get('#model').select('VimPerformanceTrend');
      cy.wait('@availableFields');
      cy.get('#trend_col', { timeout: 10000 }).should('be.visible');

      // Only 3 tabs present; Summary / Charts / Styling absent
      ['Columns', 'Filter', 'Preview'].forEach((tab) => {
        cy.contains('[role="tab"]', tab).scrollIntoView().should('be.visible');
      });
      ['Summary', 'Charts', 'Styling'].forEach((tab) => {
        cy.contains('[role="tab"]', tab).should('not.exist');
      });

      // Standard field-picker must NOT be present
      cy.get('#report-field-picker').should('not.exist');

      // "Trending for" — pick the first real option
      cy.get('#trend_col option').then(($opts) => {
        const realOpt = [...$opts].find((o) => o.value && o.value !== '');
        expect(realOpt, 'at least one trend column exists').to.exist;
        cy.get('#trend_col').select(realOpt.value);
      });
      // Wait for limit-cols fetch triggered by selecting a trend_col
      cy.wait('@trendLimitCols');
      cy.contains('Trend Target Limit').should('be.visible');
      cy.contains('Trend Target Percents').should('be.visible');

      // Trend Target Limit — Column dropdown (shown when limit cols exist)
      cy.get('body').then(($body) => {
        if ($body.find('#trend_limit_col').length) {
          cy.get('#trend_limit_col option').then(($opts) => {
            const realOpt = [...$opts].find((o) => o.value && o.value !== '');
            if (realOpt) cy.get('#trend_limit_col').select(realOpt.value);
          });
        } else {
          // No limit columns — the Value text input is shown instead
          cy.get('#trend_limit_val').should('be.visible').clear().type('90');
        }
      });

      // Trend Target Percents — set pct1 / pct2 / pct3
      cy.get('#trend_pct1').should('be.visible').select('90');
      cy.get('#trend_pct1').should('have.value', '90');
      cy.get('#trend_pct2').should('be.visible').select('75');
      cy.get('#trend_pct2').should('have.value', '75');
      cy.get('#trend_pct3').should('be.visible').select('50');
      cy.get('#trend_pct3').should('have.value', '50');

      // ── Filter tab ─────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Filter').scrollIntoView().click();
      cy.contains('Performance Timeframe').should('be.visible');

      // perf_end — select a non-default value
      cy.get('#perf_end').should('be.visible').select('2');
      cy.get('#perf_end').should('have.value', '2');

      // perf_start — select last available option
      cy.get('#perf_start option').then(($opts) => {
        if ($opts.length > 1) cy.get('#perf_start').select($opts[$opts.length - 1].value);
      });

      // Trend filter must NOT show a Primary (Record) Filter expression editor
      cy.contains(/Primary \(Record\) Filter/).should('not.exist');

      // ── Preview tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Preview').scrollIntoView().click();
      cy.contains('button', 'Refresh').should('be.visible');
      // Trend reports have no col_order so Refresh shows the prompt rather than data
      cy.contains('Add columns on the Columns tab').should('be.visible');

      // ── Save ───────────────────────────────────────────────────────────────
      cy.get('button[type="submit"]').contains('Add').click({ force: true });
      cy.wait('@saveReport').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
      });

      // ── Verify in accordion tree ───────────────────────────────────────────
      cy.selectAccordionItem(
        ['All Reports', /^My Company/, 'Custom', 'Cypress Trend Report'],
      );
      cy.expect_explorer_title('Report "');
      cy.get('#report_info').should('have.class', 'active');
      cy.contains('.cds--accordion__title', 'Basic Information').should('be.visible');
      cy.contains('.label_header', 'Title').should('be.visible');
      cy.contains('.label_header', 'Based On').should('be.visible');
      cy.contains('Cypress Trend Report Title').should('be.visible');
      // cleanup handled by afterEach → cy.appDbState('restore')
    });

    it('Can add a chargeback report', () => {
      cy.accordion('Reports');
      cy.expect_explorer_title('All Reports');

      cy.intercept('GET', '/report/react_form_data/new').as('formData');
      cy.intercept('GET', '/report/react_available_fields*').as('availableFields');
      cy.intercept('GET', '/report/react_chargeback_options*').as('chargebackOptions');
      cy.intercept('POST', '/report/react_save/new').as('saveReport');

      cy.toolbar('Configuration', 'Add a new Report');
      cy.wait('@formData');
      cy.get('.report-editor').should('be.visible');

      // ── Columns tab ────────────────────────────────────────────────────────
      cy.get('#name').clear().type('Cypress Chargeback Report');
      cy.get('#title').clear().type('Cypress Chargeback Report Title');

      // Select ChargebackVm — triggers both available-fields and chargeback-options fetches
      cy.get('#model').select('ChargebackVm');
      cy.wait('@availableFields');
      cy.wait('@chargebackOptions');

      // Only 3 tabs; Summary / Charts / Styling absent
      ['Columns', 'Filter', 'Preview'].forEach((tab) => {
        cy.contains('[role="tab"]', tab).scrollIntoView().should('be.visible');
      });
      ['Summary', 'Charts', 'Styling'].forEach((tab) => {
        cy.contains('[role="tab"]', tab).should('not.exist');
      });

      // Report creation timeout — pick a non-default option if available
      cy.get('#queue_timeout option').then(($opts) => {
        if ($opts.length > 1) cy.get('#queue_timeout').select($opts[1].value);
      });

      // Pick columns so the form is valid
      cy.get('#report-field-picker').closest('.cds--multi-select').find('.cds--list-box__field').click();
      cy.get('.cds--list-box__menu-item').first().click();
      cy.get('#report-field-picker').closest('.cds--multi-select').find('.cds--list-box__field').click();
      cy.get('.sortable-list-item').should('have.length.at.least', 1);
      cy.contains('Column headers and formatting').should('be.visible');

      // ── Filter tab ─────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Filter').scrollIntoView().click();

      // Chargeback Resources section (ChargebackVm shows both toggles + method dropdown)
      cy.contains('Chargeback Resources').should('be.visible');
      cy.get('#cb_include_metrics').should('exist');
      cy.get('#cumulative_rate_calculation').should('exist');

      // Method for allocated metrics — switch to Maximum
      cy.get('#method_for_allocated_metrics').should('be.visible').select('max');
      cy.get('#method_for_allocated_metrics').should('have.value', 'max');

      // Chargeback Filters section
      cy.contains('Chargeback Filters').should('be.visible');
      cy.get('#cb_show_typ').should('be.visible');

      // Show Costs by → Owner, which reveals the cb_owner_id dropdown
      cy.get('#cb_show_typ').select('owner');
      cy.get('#cb_owner_id').should('be.visible');

      // If any owners exist, select the first; otherwise leave at <Choose>
      cy.get('#cb_owner_id option').then(($opts) => {
        const realOpt = [...$opts].find((o) => o.value && o.value !== '');
        if (realOpt) cy.get('#cb_owner_id').select(realOpt.value);
      });

      // Group by — switch to "Date Only"
      cy.get('#cb_groupby').should('be.visible').select('date-only');
      cy.get('#cb_groupby').should('have.value', 'date-only');

      // Chargeback Interval section
      cy.contains('Chargeback Interval').should('be.visible');

      // Interval — switch to Weekly
      cy.get('#cb_interval').should('be.visible').select('weekly');
      cy.get('#cb_interval').should('have.value', 'weekly');

      // Weekly Ending With (cb_end_interval_offset) — pick "Last Week"
      cy.get('#cb_end_interval_offset').should('be.visible').select('1');
      cy.get('#cb_end_interval_offset').should('have.value', '1');

      // Going back (cb_interval_size) — pick "2 Weeks"
      cy.get('#cb_interval_size').should('be.visible').select('2');
      cy.get('#cb_interval_size').should('have.value', '2');

      // Time Zone — pick the first real timezone option
      cy.get('#tz option').then(($opts) => {
        const realOpt = [...$opts].find((o) => o.value && o.value !== '');
        if (realOpt) {
          cy.get('#tz').select(realOpt.value);
          cy.get('#tz').should('have.value', realOpt.value);
        }
      });

      // ── Preview tab ────────────────────────────────────────────────────────
      cy.contains('[role="tab"]', 'Preview').scrollIntoView().click();
      cy.contains('button', 'Refresh').should('be.visible').click();
      cy.get('.report-editor-preview').should('be.visible');

      // ── Save ───────────────────────────────────────────────────────────────
      cy.get('button[type="submit"]').contains('Add').click({ force: true });
      cy.wait('@saveReport').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
      });

      // ── Verify in accordion tree ───────────────────────────────────────────
      cy.selectAccordionItem(
        ['All Reports', /^My Company/, 'Custom', 'Cypress Chargeback Report'],
      );
      cy.expect_explorer_title('Report "');
      cy.get('#report_info').should('have.class', 'active');
      cy.contains('.cds--accordion__title', 'Basic Information').should('be.visible');
      cy.contains('.label_header', 'Title').should('be.visible');
      cy.contains('.label_header', 'Based On').should('be.visible');
      cy.contains('Cypress Chargeback Report Title').should('be.visible');
      // cleanup handled by afterEach → cy.appDbState('restore')
    });
  });

  it('Can add, edit and delete a schedule', () => {
    // Open the schedules accordion and wait for it to load
    cy.accordion('Schedules');

    // Click add schedule
    cy.toolbar('Configuration', 'Add a new Schedule');
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
    cy.toolbar('Configuration', 'Edit this Schedule');

    // Edit the schedule information
    reportFilter = '';
    cy.get('#name').clear({ force: true }).type('Cypress Test Schedule Edit', { force: true });
    cy.get('#description').clear({ force: true }).type('Cypress test schedule description edit', { force: true });

    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .btn').click({ force: true });
    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="0"] > a').click({ force: true });

    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .btn').click({ force: true });
    cy.get('#form_filter_div > .form-horizontal > :nth-child(1) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
      cy.get(option).click({ force: true }).then(() => {
        cy.get('#form_filter_div > .form-horizontal > :nth-child(2) > .col-md-8 > .btn-group > .btn', {timeout: 5000}).click({ force: true });
        cy.get('#form_filter_div > .form-horizontal > :nth-child(2) > .col-md-8 > .btn-group > .open > .dropdown-menu > [data-original-index="1"] > a').then((option) => {
          cy.get(option).click({ force: true }).then(() => {
            cy.get(':nth-child(3) > .col-md-8 > .btn-group > .btn', {timeout: 5000}).click({ force: true });
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
      cy.toolbar('Configuration', 'Delete this Schedule');
    });
  });
});

describe('Report Info / Saved Reports Tabs', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Overview', 'Reports');
    cy.accordion('Reports');
    cy.selectAccordionItem(['Configuration Management', 'Virtual Machines']);
    cy.contains('.clickable-row', 'Account Groups - Linux').click();
  });

  it('displays report tabs and switches between Report Info and Saved Reports', () => {
    cy.get('#rep-tabs-wrapper').should('be.visible');
    cy.get('.miq_custom_tabs').should('be.visible');

    cy.get('#report_info').should('have.class', 'active');
    cy.contains('Basic Information').should('be.visible');

    cy.intercept('/report/rep_change_tab*').as('changeTab');
    cy.contains('button', 'Saved Reports').should('be.visible').click();
    cy.wait('@changeTab');

    cy.get('#saved_reports').should('have.class', 'active');
    cy.get('#gtl_div').should('be.visible');

    cy.contains('button', 'Report Info').should('be.visible').click();
    cy.wait('@changeTab');

    cy.get('#report_info').should('have.class', 'active');
    cy.contains('Basic Information').should('be.visible');
  });

  it('resets to Report Info tab when navigating away and back to a report', () => {
    cy.intercept('/report/rep_change_tab*').as('changeTab');
    cy.contains('button', 'Saved Reports').should('be.visible').click();
    cy.wait('@changeTab');
    cy.get('#saved_reports').should('have.class', 'active');

    cy.get('#reports_accord.in li.list-group-item').contains('Configuration Management').click();

    cy.selectAccordionItem(['Configuration Management', 'Virtual Machines']);
    cy.contains('.clickable-row', 'Account Groups - Linux').click();

    cy.get('#rep-tabs-wrapper').should('be.visible');
    cy.get('#report_info').should('have.class', 'active');
    cy.contains('Basic Information').should('be.visible');
  });
});
