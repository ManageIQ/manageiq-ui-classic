const semver = require('semver');
const { readFileSync } = require('fs');
const { resolve } = require('path');

class NodeVersionCheckPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tap('NodeVersionCheckPlugin', () => {
      this.verify();
    });

    compiler.hooks.watchRun.tap('NodeVersionCheckPlugin', () => {
      this.verify();
    });
  }

  verify() {
    const packageJsonPath = resolve(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const requiredVersion = packageJson.engines && packageJson.engines.node;

    if (!requiredVersion) {
      return;
    }

    const currentVersion = process.version;

    if (semver.satisfies(currentVersion, requiredVersion)) {
      return;
    }

    throw new Error(
      `Node.js version mismatch. Current: ${currentVersion}. Required: ${requiredVersion}.`
    );
  }
}

module.exports = NodeVersionCheckPlugin;

