/* eslint-disable no-undef */
describe('Settings > My Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.interceptApi({
      method: 'GET',
      alias: 'userSettingsLoad',
      urlPattern: '/api/users/*',
      triggerFn: () => cy.menu('Settings', 'My Settings'),
    });
  });

  it('Saves the start page setting', () => {
    cy.getFormInputFieldByIdAndType({ inputId: 'display.startpage' }).then(
      (value) => {
        expect(value[0].value).to.be.oneOf(['', 'Overview / Utilization']);
      }
    );
    cy.changeSelect('display.startpage', 'Overview / Dashboard');
    cy.intercept('PATCH', '/api/users/*').as('settingsUpdate');
    cy.getFormButtonByTypeWithText({
      buttonText: 'Save',
      buttonType: 'submit',
    }).click();
    cy.wait('@settingsUpdate').its('response.statusCode').should('eq', 200);

    // Wait for page to load before clicking log out to prevent errors
    cy.get('[name="general-subform"] > :nth-child(2) > .cds--select');
    cy.menu('Logout');
    cy.login();
    cy.url().should('include', '/dashboard');

    cy.interceptApi({
      method: 'GET',
      alias: 'userSettingsReload',
      urlPattern: '/api/users/*',
      triggerFn: () => cy.menu('Settings', 'My Settings'),
    });
    cy.getFormInputFieldByIdAndType({ inputId: 'display.startpage' }).should(
      'have.value',
      'Overview / Dashboard'
    );
    cy.changeSelect('display.startpage', 'Overview / Utilization');
    cy.intercept('PATCH', '/api/users/*').as('settingsUpdate');
    cy.getFormButtonByTypeWithText({
      buttonText: 'Save',
      buttonType: 'submit',
    }).click();
    cy.wait('@settingsUpdate').its('response.statusCode').should('eq', 200);

    cy.get('[name="general-subform"] > :nth-child(2) > .cds--select');
    cy.menu('Logout');
    cy.login();
    cy.url().should('include', '/utilization');
  });
});
