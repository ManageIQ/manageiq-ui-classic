// CypressOnRails: don't remove these commands
Cypress.Commands.add('appCommands', function (body) {
  Object.keys(body).forEach(key => body[key] === undefined ? delete body[key] : {});
  const log = Cypress.log({ name: "APP", message: body, autoEnd: false })
  return cy.request({
    method: 'POST',
    url: "/__e2e__/command",
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    log: false,
    failOnStatusCode: false
  }).then((response) => {
    log.end();
    if (response.status !== 201) {
      expect(response.body.message).to.equal('')
      expect(response.status).to.be.equal(201)
    }
    return response.body
  });
});

Cypress.Commands.add('app', function (name, command_options) {
  return cy.appCommands({name: name, options: command_options}).then((body) => {
    return body[0]
  });
});

Cypress.Commands.add('appEval', function (code) {
  return cy.app('eval', code)
});

Cypress.Commands.add('appFactories', function (options) {
  return cy.app('factory_bot', options)
});

Cypress.Commands.add('appFixtures', function (options) {
  cy.app('activerecord_fixtures', options)
});

Cypress.Commands.add('appScenario', function (name, options = {}) {
  return cy.app('scenarios/' + name, options)
});

// CypressOnRails: end

// TODO: Consider adding the log_fail entrypoint below.  It was from the generator and removed because it hooks the Cypress.on('fail') event, which some tests rely on.
// 1: https://github.com/shakacode/cypress-playwright-on-rails/blob/master/lib/generators/cypress_on_rails/templates/spec/cypress/support/on-rails.js
// 2: https://github.com/shakacode/cypress-playwright-on-rails/blob/master/lib/generators/cypress_on_rails/templates/spec/e2e/app_commands/log_fail.rb
