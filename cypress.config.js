const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'i6pndu',
  e2e: {
    baseUrl: 'https://parabank.parasoft.com',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,
      reportPageTitle: 'ParaBank Cypress Report',
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
    env: {
      apiUrl: 'https://parabank.parasoft.com/parabank/services/bank',
      validUser: 'john',
      validPassword: 'demo',
    },
  },
});
