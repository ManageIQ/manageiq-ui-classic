/* eslint-disable no-undef */
const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportHeight: 800,
    viewportWidth: 1800,
    numTestsKeptInMemory: 5,
    videoCompression: false,
    allowCypressEnv: false,
    // Enable before:run event in open mode (cypress open) for local development.
    // Required for on('before:run'...) hook (see #10026) to capture DB state.
    // Note: after:run is only used in CI (run mode). Can be removed if Cypress defaults
    // to enabling these events or if we no longer need the before:run hook.
    experimentalInteractiveRunEvents: true,

    // See: https://docs.cypress.io/app/references/experiments#Experimental-Flake-Detection-Features
    retries: {
      experimentalStrategy: 'detect-flake-and-pass-on-threshold',
      experimentalOptions: {
        maxRetries: 3,
        passesRequired: 1,
      },

      openMode: false,
      runMode: true,
    },
    setupNodeEvents(on, _config) {
      // Check for Cypress build marker
      const markerPath = path.resolve(__dirname, 'tmp/.cypress-build-marker');
      if (!fs.existsSync(markerPath)) {
        const errorMsg = [
          '',
          '================================================================================',
          '❌ ERROR: Webpack was not built with CYPRESS=true',
          '================================================================================',
          '',
          'Debug notifications will appear in the UI and may block elements.',
          '',
          'To fix this, rebuild webpack with:',
          '  CYPRESS=true bin/webpack',
          '',
          '================================================================================',
          '',
        ].join('\n');
        console.error(errorMsg);

        throw new Error('Webpack was not built with CYPRESS=true. See console for details');
      }

      // Capture DB state once before entire test run
      on('before:run', async () => {
        await fetch('http://localhost:3000/__e2e__/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'db_state', options: 'capture' })
        });
      });

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
      on('before:browser:launch', (browser = {}, launchOptions) => {
        console.log('Launching browser:', browser.name);
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-features=AutofillServerCommunication');
        }
        return launchOptions;
      });
    },
  },
});
