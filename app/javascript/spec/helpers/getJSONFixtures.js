const path = require('path');

const fixturesPath = '../fixtures/json';

const getJSONFixture = fixturePath =>
  require(path.join(__dirname, fixturesPath, fixturePath)); // eslint-disable-line global-require

window.getJSONFixture = getJSONFixture;
