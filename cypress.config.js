/* eslint-disable no-undef */
const { defineConfig } = require('cypress');
const fs = require('fs');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportHeight: 800,
    viewportWidth: 1800,
    numTestsKeptInMemory: 0,
    videoCompression: false,

    // See: https://docs.cypress.io/app/references/experiments#Experimental-Flake-Detection-Features
    retries: {
      experimentalStrategy: 'detect-flake-and-pass-on-threshold',
      experimentalOptions: {
        maxRetries: 9,
        passesRequired: 1,
      },

      openMode: false,
      runMode: true,
    },
    // eslint-disable-next-line no-unused-vars
    setupNodeEvents(on, config) {
      on('after:spec', (spec, results) => {
        // Delete the video on CI if the spec passed and no tests retried
        if (process.env.CI && results && results.video && fs.existsSync(results.video)) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
          );
          if (!failures) {
            fs.unlinkSync(results.video);
          }
        }
      });
    },
  },
});
