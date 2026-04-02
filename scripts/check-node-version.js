#!/usr/bin/env node

/**
 * Node.js Version Checker
 * 
 * This script validates that the current Node.js version satisfies
 * the version requirement specified in package.json engines.node field.
 * 
 * If the version doesn't match, it displays a detailed error message
 * with installation instructions and exits with code 1.
 */

const semver = require('semver');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function formatError(message) {
  return `${colors.red}${colors.bold}${message}${colors.reset}`;
}

function formatWarning(message) {
  return `${colors.yellow}${message}${colors.reset}`;
}

function formatSuccess(message) {
  return `${colors.green}${message}${colors.reset}`;
}

function formatInfo(message) {
  return `${colors.cyan}${message}${colors.reset}`;
}

function checkNodeVersion() {
  try {
    // Read package.json to get required Node version
    const packageJsonPath = resolve(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    const requiredVersion = packageJson.engines?.node;
    
    if (!requiredVersion) {
      console.warn(formatWarning('⚠️  Warning: No Node.js version requirement found in package.json engines.node'));
      return;
    }
    
    // Get current Node version
    const currentVersion = process.version;
    
    // Check if current version satisfies the requirement
    if (semver.satisfies(currentVersion, requiredVersion)) {
      console.log(formatSuccess(`✓ Node.js version ${currentVersion} satisfies requirement ${requiredVersion}`));
      return;
    }
    
    // Version mismatch - display error message
    console.error('\n' + '='.repeat(70));
    console.error(formatError('ERROR: Node.js Version Mismatch'));
    console.error('='.repeat(70) + '\n');
    
    console.error(formatError(`Current Node.js version: ${currentVersion}`));
    console.error(formatError(`Required Node.js version: ${requiredVersion}`));
    console.error('');
    
    console.error(formatInfo('Please install a compatible Node.js version to continue.'));
    console.error('');
    console.error('='.repeat(70) + '\n');
    
    process.exit(1);
    
  } catch (error) {
    console.error(formatError('Error checking Node.js version:'), error.message);
    process.exit(1);
  }
}

// Run the check
checkNodeVersion();
