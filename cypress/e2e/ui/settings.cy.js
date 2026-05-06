/* eslint-disable no-undef */
describe('Settings > My Settings', () => {
  const interceptUserSettingsLoad = (alias = 'userSettingsLoad') => {
    cy.interceptApi({
      method: 'GET',
      alias,
      urlPattern: '/api/users/*',
      triggerFn: () => cy.menu('Settings', 'My Settings'),
    });
  };

  beforeEach(() => {
    cy.login('admin', 'smartvm', { cached: true });
    cy.visit('/dashboard/show'); // Cached login requires visiting an authenticated page
    interceptUserSettingsLoad();
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
    cy.login('admin', 'smartvm'); // No caching - testing logout/login flow
    cy.url().should('include', '/dashboard');

    interceptUserSettingsLoad('userSettingsReload');
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
    cy.login('admin', 'smartvm'); // No caching - testing logout/login flow
    cy.url().should('include', '/utilization');
  });
});
