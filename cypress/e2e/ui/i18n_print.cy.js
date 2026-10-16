// The VM right-size print page is used as a representative example: it renders
// a React component inside the print layout with several __() calls.

describe('Print layout i18n', () => {
  let vm;
  let esUser;

  before(() => {
    cy.appFactories([
      ['create', 'small_environment'],
    ]).then(() => {
      cy.appEval('Vm.first.id').then((id) => {
        vm = { id };
      });
    });

    cy.appFactories([
      ['create', 'user', {
        userid : 'cypress_pt_BR',
        role   : 'super_administrator',
      }],
    ]).then(([user]) => {
      esUser = user;
      // pt_BR is chosen deliberately: it is non-English and its underscore
      // form verifies that the lang attribute is set correctly for compound locales.
      cy.appEval(`
        u = User.find(${user.id})
        u.settings.store_path(:display, :locale, 'pt_BR')
        u.save!
      `);
    });
  });

  after(() => {
    cy.appDbState('restore');
  });

  context('with the user locale set to English (default)', () => {
    beforeEach(() => {
      cy.login();
    });

    it('renders headings in English', () => {
      cy.get('.navbar-brand-name'); // wait for session to be fully established before navigating directly to print URL
      cy.visit(`/vm_infra/right_size_print/${vm.id}`, {
        onBeforeLoad(win) { win.print = cy.stub().as('print'); },
      });

      cy.get('html').should('have.attr', 'lang', 'en');
      cy.contains('h3', "Normal Operating Ranges (up to 30 days' data)").should('be.visible');
    });
  });

  context('with the user locale set to pt_BR (non-English, compound locale)', () => {
    beforeEach(() => {
      cy.login(esUser.userid, 'dummy');
    });

    it('renders headings in a non-English language', () => {
      cy.get('.navbar-brand-name'); // wait for session to be fully established before navigating directly to print URL
      cy.visit(`/vm_infra/right_size_print/${vm.id}`, {
        onBeforeLoad(win) { win.print = cy.stub().as('print'); },
      });

      cy.get('html').should('have.attr', 'lang', 'pt_BR');
      cy.contains('h3', 'Intervalos operacionais normais').should('be.visible');
      cy.contains('h3', 'Intervalos operacionais normais')
        .should('not.contain', 'Normal Operating Ranges');
    });
  });
});
