/**
 * Generates tsconfig.webpack.json dynamically from webpack paths configuration
 * This ensures TypeScript checking includes all plugin/engine directories
 */

import * as fs from 'fs';
import * as path from 'path';

type Engine = {
  root: string;
  node_modules: string;
};

type Engines = {
  [engineName: string]: Engine;
};

/**
 * Generate tsconfig.webpack.json with all engine paths
 * @param rootDir - Project root directory
 * @param engines - Engines configuration from paths.json
 */
export function generateTsConfigWebpack(
  rootDir: string,
  engines: Engines
): void {
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
 * @param tsconfigPath - Path to tsconfig.webpack.json
 * @param pathsJsonPath - Path to paths.json
 * @returns True if regeneration is needed
 */
export function needsRegeneration(
  tsconfigPath: string,
  pathsJsonPath: string
): boolean {
  if (!fs.existsSync(tsconfigPath)) {
    return true;
  }

  // Regenerate if paths.json is newer than tsconfig
  const tsconfigMtime = fs.statSync(tsconfigPath).mtime;
  const pathsJsonMtime = fs.statSync(pathsJsonPath).mtime;

  return pathsJsonMtime > tsconfigMtime;
}
