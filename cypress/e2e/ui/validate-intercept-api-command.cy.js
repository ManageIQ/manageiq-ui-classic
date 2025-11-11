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
    // Tree select api wait is handled from selectAccordionItem with alias 'treeSelectApi'
    cy.selectAccordionItem([/^ManageIQ Region:/, /^Zone:/]);
    // verifies that the alias is set and the request is intercepted & awaited
    cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
      expect(interceptedAliasesObject).to.have.property('post-treeSelectApi');
    });
  });

  it('Should register multiple unique aliases', () => {
    // first api with alias 'accordionSelectApi'(Accordion select api wait is handled from cy.accordion command with alias 'accordionSelectApi')
    cy.accordion('Diagnostics');
    // second api with alias 'treeSelectApi'(Tree select api wait is handled from selectAccordionItem with alias 'treeSelectApi')
    cy.selectAccordionItem([/^ManageIQ Region:/, /^Zone:/]);
    // verifies that both the aliases are set and the request is intercepted & awaited
    cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
      expect(interceptedAliasesObject).to.include.all.keys(
        'post-accordionSelectApi',
        'post-treeSelectApi'
      );
    });
  });

  it('Should not register duplicate alias', () => {
    // first api with alias 'accordionSelectApi'(Accordion select api wait is handled from cy.accordion command with alias 'accordionSelectApi')
    cy.accordion('Diagnostics');
    cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
      expect(Object.keys(interceptedAliasesObject).length).to.equal(1);
    });
    // second api with alias 'treeSelectApi'(Tree select api wait is handled from selectAccordionItem with alias 'treeSelectApi')
    cy.selectAccordionItem([/^ManageIQ Region:/, /^Zone:/]);
    cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
      expect(Object.keys(interceptedAliasesObject).length).to.equal(2);
    });
    // third api with a duplicate alias as above 'accordionSelectApi'(Accordion select api wait is handled from cy.accordion command with alias 'accordionSelectApi')
    cy.accordion('Access Control');
    // assert that the alias is not overwritten
    cy.getInterceptedApiAliases().then((interceptedAliasesObject) => {
      expect(Object.keys(interceptedAliasesObject).length).to.equal(2);
    });
  });
});
