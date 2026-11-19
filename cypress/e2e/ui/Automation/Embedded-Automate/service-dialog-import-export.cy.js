import { flashClassMap } from '../../../../support/assertions/assertion_constants';

const IMPORT_DIALOG_LABEL = 'Cypress Imported Dialog';
const EXPORT_DIALOG_LABEL = 'Cypress Export Dialog';

const validDialogYaml = `---
- description: Dialog imported by Cypress
  label: ${IMPORT_DIALOG_LABEL}
  dialog_tabs:
  - label: Tab
    dialog_groups:
    - label: Group
      dialog_fields:
      - name: text_box
        label: Text box
        type: DialogFieldTextBox
        data_type: string
        position: 0
`;

const chooseFile = (contents, fileName = 'dialogs.yml') => {
  cy.get('input[name="upload[file]"]').selectFile({
    contents: Cypress.Buffer.from(contents),
    fileName,
    mimeType: 'text/yaml',
  }, { force: true });
};

describe('Automation > Embedded Automate > Customization > Service Dialog Import/Export', () => {
  beforeEach(() => {
    cy.appFactories([
      ['create', 'dialog', { label: EXPORT_DIALOG_LABEL }],
    ]);
    cy.login();
    cy.menu('Automation', 'Embedded Automate', 'Customization');
    cy.accordion('Import/Export');
    cy.selectAccordionItem(['Service Dialog Import/Export']);
    cy.get('.service-dialog-import-export').should('be.visible');
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe('Page layout', () => {
    it('displays the import and export sections', () => {
      cy.contains('.service-dialog-import-section h3', 'Import').should('be.visible');
      cy.contains('.service-dialog-export-section h3', 'Export').should('be.visible');
    });

    it('accepts only yaml files', () => {
      cy.get('input[name="upload[file]"]').should('have.attr', 'accept', '.yml,.yaml');
    });
  });

  describe('Import', () => {
    it('keeps the Upload button disabled until a file is chosen', () => {
      cy.contains('button', 'Upload').should('be.disabled');
      chooseFile(validDialogYaml);
      cy.contains('button', 'Upload').should('not.be.disabled');
    });

    it('shows an error when the uploaded file is blank', () => {
      chooseFile('');
      cy.interceptApi({
        alias: 'uploadImportFile',
        urlPattern: '/miq_ae_customization/upload_import_file',
        triggerFn: () => cy.contains('button', 'Upload').click(),
      });

      cy.expect_flash(flashClassMap.error, 'the uploaded file is blank');
      cy.get('.service-dialog-review-import-modal').should('not.exist');
    });

    it('shows an error when the file is not a service dialog export', () => {
      chooseFile('---\n- foo: bar\n');
      cy.interceptApi({
        alias: 'uploadNonDialog',
        urlPattern: '/miq_ae_customization/upload_import_file',
        triggerFn: () => cy.contains('button', 'Upload').click(),
      });

      cy.expect_flash(flashClassMap.error, 'incorrect Dialog format');
    });

    it('uploads a file, reviews the dialogs and imports the selected one', () => {
      chooseFile(validDialogYaml);
      cy.interceptApi({
        alias: 'uploadValidFile',
        urlPattern: '/miq_ae_customization/upload_import_file',
        triggerFn: () => cy.contains('button', 'Upload').click(),
      });

      cy.expect_flash(flashClassMap.info, 'Select Dialogs to import');
      cy.get('.service-dialog-review-import-modal').within(() => {
        cy.contains(IMPORT_DIALOG_LABEL).should('be.visible');
        cy.contains('New object').should('be.visible');
        cy.contains('button', 'Commit').should('be.disabled');
        cy.contains('tr', IMPORT_DIALOG_LABEL).find('input[type="checkbox"]').check({ force: true });
      });

      cy.interceptApi({
        alias: 'importServiceDialogs',
        urlPattern: '/miq_ae_customization/import_service_dialogs',
        triggerFn: () => cy.get('.service-dialog-review-import-modal').contains('button', 'Commit').click(),
      });

      // The page reloads after a successful import and shows the flash message queued before it.
      cy.expect_flash(flashClassMap.success, 'Service dialogs imported successfully');
      cy.get('.service-dialog-review-import-modal').should('not.exist');
    });

    it('cancels the review step without importing', () => {
      chooseFile(validDialogYaml);
      cy.interceptApi({
        alias: 'uploadBeforeCancel',
        urlPattern: '/miq_ae_customization/upload_import_file',
        triggerFn: () => cy.contains('button', 'Upload').click(),
      });

      cy.interceptApi({
        alias: 'cancelImport',
        urlPattern: '/miq_ae_customization/cancel_import_service_dialogs',
        triggerFn: () => cy.get('.service-dialog-review-import-modal').contains('button', 'Cancel').click(),
      });

      cy.get('.service-dialog-review-import-modal').should('not.exist');
    });
  });

  describe('Export', () => {
    it('keeps the Export button disabled until a dialog is selected', () => {
      cy.get('#export-service-dialogs').should('be.disabled');

      cy.get('#service-dialog-export-select').click();
      cy.contains('.cds--list-box__menu-item', EXPORT_DIALOG_LABEL).click();

      cy.get('#export-service-dialogs').should('not.be.disabled');
    });
  });
});
