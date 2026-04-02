#!/usr/bin/env node

/**
 * Node.js Version Checker
 *
 * This script validates that the current Node.js version satisfies
 * the version requirement specified in package.json engines.node field.
 *
 * If the version doesn't match, it displays a detailed error message
 * with installation instructions and exits
 */

const semver = require('semver');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function formatError(message) {
  return `${colors.red}${message}${colors.reset}`;
}

function formatWarning(message) {
  return `${colors.yellow}${message}${colors.reset}`;
}

function checkNodeVersion() {
  try {
    const packageJsonPath = resolve(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    const requiredVersion = packageJson.engines?.node;

    if (!requiredVersion) {
      console.warn(formatWarning('⚠️  Warning: No Node.js version requirement found in package.json engines.node'));
      return;
    }

    const currentVersion = process.version;

    if (semver.satisfies(currentVersion, requiredVersion)) {
      return;
    }

    // Version mismatch - display error message
    console.error(formatError('ERROR: Node.js Version Mismatch'));
    console.error(formatError(`Current Node.js version: ${currentVersion}`));
    console.error(formatError(`Required Node.js version: ${requiredVersion}`));

    process.exit(1);
  } catch (error) {
    console.error(formatError('Error checking Node.js version:'), error.message);
    process.exit(1);
  }
}

checkNodeVersion();
