const { defineConfig } = require('cypress');
const fs = require('fs')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    numTestsKeptInMemory: 0,
    videoCompression: false,
    setupNodeEvents(on, config) {
      on('after:spec', (spec, results) => {
        // Delete the video on CI if the spec passed and no tests retried
        if (process.env.CI && results && results.video && fs.existsSync(results.video)) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
          )
          if (!failures) {
            fs.unlinkSync(results.video)
          }
        }
      })
    },
  },
});
