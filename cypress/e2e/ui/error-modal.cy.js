const emitError = (payload) => {
  cy.get('#main-menu').should('exist');
  cy.window().its('sendDataWithRx').should('be.a', 'function');
  cy.window().then((win) => {
    win.sendDataWithRx(payload);
  });
};

describe('MiqErrorModal', () => {
  beforeEach(() => {
    cy.login();
  });

  it('shows server error details from sendDataWithRx', () => {
    cy.window().then((win) => {
      return emitError({
        serverError: {
          data: 'Test server error [foo/bar]',
          url: `${win.location.origin}/foo/bar`,
        },
        source: 'server',
      });
    });

    cy.contains('.cds--modal-header__heading', 'Server Error');
    cy.contains('.miq-error-modal-row', 'URL').should('contain.text', '/foo/bar');
    cy.contains('.miq-error-modal-row', 'Data').should('contain.text', 'Test server error [foo/bar]');
    cy.contains('.miq-error-modal-row', 'Status').should('not.exist');
    cy.contains('.miq-error-modal-row', 'Content-Type').should('not.exist');
  });

  it('shows $http error details from sendDataWithRx', () => {
    cy.window().then((win) => {
      return emitError({
        serverError: {
          data: 'Validation failed: name is required',
          status: 400,
          statusText: 'Bad Request',
          config: {
            url: '/api/cloud_tenants/2',
          },
          headers: (name) => {
            if (name === 'content-type') {
              return 'text/plain; charset=utf-8';
            }
            return undefined;
          },
        },
        source: '$http',
        backendName: win.__('$http'),
      });
    });

    cy.contains('.cds--modal-header__heading', 'Server Error ($http)');
    cy.contains('.miq-error-modal-row', 'URL').should('contain.text', '/api/cloud_tenants/2');
    cy.contains('.miq-error-modal-row', 'Status').should('contain.text', '400 Bad Request');
    cy.contains('.miq-error-modal-row', 'Content-Type').should('contain.text', 'text/plain; charset=utf-8');
    cy.contains('.miq-error-modal-row', 'Data').should('contain.text', 'Validation failed: name is required');
  });

  it('shows fetch html error details from sendDataWithRx', () => {
    cy.window().then((win) => {
      return emitError({
        serverError: {
          data: `<!DOCTYPE html><html><body>The page you were looking for does not exist.</body></html>`,
          status: 404,
          statusText: 'Not Found',
          url: `${win.location.origin}/api/cloud_tenants1/2`,
          headers: new win.Headers({
            'content-type': 'text/html; charset=utf-8',
          }),
        },
        source: 'fetch',
        backendName: 'API',
      });
    });

    cy.contains('.cds--modal-header__heading', 'Server Error (API)');
    cy.contains('.miq-error-modal-row', 'URL').should('contain.text', '/api/cloud_tenants1/2');
    cy.contains('.miq-error-modal-row', 'Status').should('contain.text', '404 Not Found');
    cy.contains('.miq-error-modal-row', 'Content-Type').should('contain.text', 'text/html; charset=utf-8');
    cy.contains('.miq-error-modal-row', 'Data').should('contain.text', 'The page you were looking for does not exist.');
    cy.get('.miq-error-modal__data').should('not.contain.text', '<body>');
  });
});
