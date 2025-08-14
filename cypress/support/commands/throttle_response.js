// Usage: cy.throttle_response(1000, 56);
Cypress.Commands.add('throttle_response', (response_delay, throttle_kbps) => {
  cy.intercept(
    {
      url: 'http://localhost:3000/**',
      middleware: true,
    },
    (req) => {
        req.on('response', (res) => {
            // Add response delay and throttle network to simulate slower networks
            res.setDelay(response_delay).setThrottle(throttle_kbps)
        })
    }
  )
});

