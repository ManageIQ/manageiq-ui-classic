const CU_COLLECTION_SAVE_URL = '/ops/cu_collection_update';
const TAB = () => cy.get('#settings_cu_collection');

const toggleAndSave = (btnSelector, toggleAlias, restoreAlias) => {
  TAB().find(btnSelector)
    .scrollIntoView()
    .then(($btn) => {
      const initial = $btn.attr('aria-checked');
      const expected = initial === 'true' ? 'false' : 'true';

      cy.wrap($btn).click({ force: true });
      TAB().find(btnSelector).should('have.attr', 'aria-checked', expected);
    });

  cy.interceptApi({
    alias: toggleAlias,
    method: 'POST',
    urlPattern: CU_COLLECTION_SAVE_URL,
    triggerFn: () =>
      TAB().find('button[type="submit"]').contains('Save').scrollIntoView().click({ force: true }),
    onApiResponse: (interception) => {
      expect(interception.response.statusCode).to.equal(200);
      TAB().find('.cds--inline-notification--success').scrollIntoView().should('be.visible');
    },
  });

  // Restore original state
  TAB().find(btnSelector).scrollIntoView().click({ force: true });

  cy.interceptApi({
    alias: restoreAlias,
    method: 'POST',
    urlPattern: CU_COLLECTION_SAVE_URL,
    triggerFn: () =>
      TAB().find('button[type="submit"]').contains('Save').scrollIntoView().click({ force: true }),
    onApiResponse: (interception) => {
      expect(interception.response.statusCode).to.equal(200);
    },
  });
};

const toggleHidesTree = (btnSelector, treeSelector) => {
  TAB().find(btnSelector)
    .scrollIntoView()
    .then(($btn) => {
      const isOn = $btn.attr('aria-checked') === 'true';
      const tree = TAB().find(treeSelector);

      if (isOn) {
        tree.should('not.exist');
        cy.wrap($btn).click({ force: true });
        TAB().find(treeSelector).scrollIntoView().should('be.visible');
        TAB().find(btnSelector).scrollIntoView().click({ force: true });
        TAB().find(treeSelector).should('not.exist');
      } else {
        tree.scrollIntoView().should('be.visible');
        cy.wrap($btn).click({ force: true });
        TAB().find(treeSelector).should('not.exist');
        TAB().find(btnSelector).scrollIntoView().click({ force: true });
        TAB().find(treeSelector).scrollIntoView().should('be.visible');
      }
    });
};

describe('Settings > Application Settings > Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Settings', 'Application Settings');
    cy.accordion('Settings');
    cy.selectAccordionItem([/^ManageIQ Region:/]);
    cy.tabs({ tabLabel: 'C & U Collection' });
  });

  describe('C&U Collection tab', () => {
    it('renders the form with clusters and datastores sections', () => {
      TAB().find('.clusters-box').scrollIntoView().should('be.visible');
      TAB().find('.datastores-box').scrollIntoView().should('be.visible');
    });

    it('Save button is disabled when the form is pristine', () => {
      TAB().find('button[type="submit"]').contains('Save')
        .scrollIntoView()
        .should('be.disabled');
    });

    it('Reset re-initialises the form from the server', () => {
      TAB().find('button#all-clusters.cds--toggle__button').scrollIntoView().click({ force: true });

      cy.interceptApi({
        alias: 'fetchCuCollection',
        method: 'GET',
        urlPattern: '/ops/cu_collection_fetch',
        triggerFn: () =>
          TAB().find('button[type="button"]').contains('Reset').scrollIntoView().click({ force: true }),
      });

      TAB().find('button[type="submit"]').contains('Save')
        .scrollIntoView()
        .should('be.disabled');
    });

    it('Collect all clusters/datastores — toggle saves and shows/hides checkbox trees', () => {
      toggleAndSave(
        'button#all-clusters.cds--toggle__button',
        'saveCuCollectionClustersToggled',
        'saveCuCollectionClustersRestored',
      );
      toggleAndSave(
        'button#all_datastores.cds--toggle__button',
        'saveCuCollectionDatastoresToggled',
        'saveCuCollectionDatastoresRestored',
      );
      toggleHidesTree(
        'button#all-clusters.cds--toggle__button',
        '.clusters-box .checkbox-tree-wrapper',
      );
      toggleHidesTree(
        'button#all_datastores.cds--toggle__button',
        '.datastores-box .checkbox-tree-wrapper',
      );
    });
  });
});
