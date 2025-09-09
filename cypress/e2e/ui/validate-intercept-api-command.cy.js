/* eslint-disable no-undef */

// TODO: Remove this test once interceptApi command becomes stable
describe('Validate intercept command', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application settings
    cy.menu('Settings', 'Application Settings');
  });

  it('Should register the alias, intercept, wait & validate response status code when an API is fired', () => {
    cy.accordion('Diagnostics');
    cy.interceptApi({
      alias: 'treeSelectApi',
      urlPattern: /\/ops\/tree_select\?id=.*&text=.*/,
      triggerFn: () => cy.selectAccordionItem([/^ManageIQ Region:/, /^Zone:/]),
      onApiResponse: (interception) => {
        expect(interception.response.statusCode).to.equal(200);
      },
    }).then(() => {
      // verifies that the alias is set and the request is intercepted & awaited
      cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
        expect(interceptedAliasesObject).to.have.property('post-treeSelectApi');
      });
    });
  });

  it('Should register multiple unique aliases', () => {
    // first api with alias 'accordionSelectApi'
    cy.interceptApi({
      alias: 'accordionSelectApi',
      urlPattern: /\/ops\/accordion_select\?id=.*/,
      triggerFn: () => cy.accordion('Diagnostics'),
    });
    // second api with alias 'treeSelectApi'
    cy.interceptApi({
      alias: 'treeSelectApi',
      urlPattern: /\/ops\/tree_select\?id=.*&text=.*/,
      triggerFn: () => cy.selectAccordionItem([/^ManageIQ Region:/, /^Zone:/]),
    }).then(() => {
      // verifies that both the aliases are set and the request is intercepted & awaited
      cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
        expect(interceptedAliasesObject).to.include.all.keys(
          'post-accordionSelectApi',
          'post-treeSelectApi'
        );
      });
    });
  });

  it('Should not register duplicate alias', () => {
    // add first api with alias 'accordionSelectApi'
    cy.interceptApi({
      alias: 'accordionSelectApi',
      urlPattern: /\/ops\/accordion_select\?id=.*/,
      triggerFn: () => cy.accordion('Diagnostics'),
    }).then(() => {
      cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
        expect(Object.keys(interceptedAliasesObject).length).to.equal(1);
      });
    });
    // second first api with alias 'treeSelectApi'
    cy.interceptApi({
      alias: 'treeSelectApi',
      urlPattern: /\/ops\/tree_select\?id=.*&text=.*/,
      triggerFn: () => cy.selectAccordionItem([/^ManageIQ Region:/, /^Zone:/]),
    }).then(() => {
      cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
        expect(Object.keys(interceptedAliasesObject).length).to.equal(2);
      });
    });
    // third api with a duplicate alias as above 'accordionSelectApi'
    cy.interceptApi({
      alias: 'accordionSelectApi',
      urlPattern: /\/ops\/accordion_select\?id=.*/,
      triggerFn: () => cy.accordion('Access Control'),
    }).then(() => {
      // assert that the alias is not overwritten
      cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
        expect(Object.keys(interceptedAliasesObject).length).to.equal(2);
      });
    });
  });
});
