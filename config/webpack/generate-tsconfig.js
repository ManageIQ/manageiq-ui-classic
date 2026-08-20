/**
 * Generates tsconfig.webpack.json dynamically from webpack paths configuration
 * This ensures TypeScript checking includes all plugin/engine directories
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate tsconfig.webpack.json with all engine paths
 * @param {string} rootDir - Project root directory
 * @param {Object} engines - Engines configuration from paths.json
 */
function generateTsConfigWebpack(rootDir, engines) {
  // Extract engine roots and generate include paths
  const enginePaths = Object.keys(engines).map((engineName) => {
    const engineRoot = engines[engineName].root;
    // Make path relative to the main repo root
    const relativePath = path.relative(
      rootDir,
      path.resolve(engineRoot, 'app/javascript')
    );
    return `${relativePath}/**/*`;
  });

  const tsconfigWebpack = {
    extends: './tsconfig.json',
    include: enginePaths,
  };

  const outputPath = path.resolve(rootDir, 'tsconfig.webpack.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(tsconfigWebpack, null, 2) + '\n',
    'utf8'
  );

  console.log('✓ Generated tsconfig.webpack.json with paths:');
  enginePaths.forEach((p) => console.log(`  - ${p}`));
}

/**
 * Check if tsconfig.webpack.json needs regeneration
 * @param {string} tsconfigPath - Path to tsconfig.webpack.json
 * @param {string} pathsJsonPath - Path to paths.json
 * @returns {boolean} True if regeneration is needed
 */
function needsRegeneration(tsconfigPath, pathsJsonPath) {
  if (!fs.existsSync(tsconfigPath)) {
    return true;
  }

  // Regenerate if paths.json is newer than tsconfig
  const tsconfigMtime = fs.statSync(tsconfigPath).mtime;
  const pathsJsonMtime = fs.statSync(pathsJsonPath).mtime;

  return pathsJsonMtime > tsconfigMtime;
}

module.exports = { generateTsConfigWebpack, needsRegeneration };
