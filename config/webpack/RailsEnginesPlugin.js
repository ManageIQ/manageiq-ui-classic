"use strict";

const getPaths = require("enhanced-resolve/lib/getPaths");
const forEachBail = require("enhanced-resolve/lib/forEachBail");

module.exports = class RailsEnginesPlugin {
  constructor(source, target, engines, { packages, root }) {
    this.source = source;
    this.target = target;
    this.engines = engines;
    this.shared = { packages, root };
  }

  // match path to engine, even if it's under another engine's vendor (longest match)
  pathToEngine(path) {
    const pathLength = (path) => (path.match(/\//g) || []).length;

    const candidates = (path, field) => Object.keys(this.engines)
      .filter((engine) => path.startsWith(this.engines[engine][field]))
      .sort((a, b) => {
        const aLen = pathLength(this.engines[a][field]);
        const bLen = pathLength(this.engines[b][field]);

        return bLen - aLen;
      });

    const rootCandidates = candidates(path, 'root');
    const moduleCandidates = candidates(path, 'node_modules');

    if (moduleCandidates[0]) {
      return { engine: moduleCandidates[0], inNodeModules: true };
    } else if (rootCandidates[0]) {
      return { engine: rootCandidates[0], inNodeModules: false };
    } else {
      // yarn linked package requiring further stuff - limited to shared packages or nested node_modules
      return { engine: 'manageiq-ui-classic', inNodeModules: true, fallback: true };
    }
  }

  apply(resolver) {
    const target = resolver.ensureHook(this.target);

    resolver.getHook(this.source).tapAsync("RailsEnginesPlugin", (request, resolveContext, callback) => {
      const engine = this.pathToEngine(request.path);
      const engineModules = !engine.fallback ?
        this.engines[engine.engine].node_modules :
        `${request.descriptionFileRoot}/node_modules`;
      const inNodeModules = engine.inNodeModules;

      const packageName = request.request.split('/')[0];
      let targetEngineModules = engineModules;

      if (engine.fallback) {
        console.warn(`RailsEnginesPlugin: no engine found for ${request.path} asking for ${request.request} (only a problem if you're *not* using yarn link)`);
      }

      if (this.shared.packages.includes(packageName) || engine.fallback) {
        targetEngineModules = this.shared.root;
      }

      if (! inNodeModules) {
        const obj = {
          ...request,
          path: targetEngineModules,
          request: `./${request.request}`,
        };

        resolver.doResolve(target, obj, `engine ${engine.engine}`, resolveContext, callback);
        return;
      }

      // only look in paths under the plugin's node_modules
      const paths = getPaths(request.path).paths;
      const engineBoundary = paths.indexOf(engineModules); // not targetEngineModules

      const cutPaths = paths.slice(0, engineBoundary);
      let joinedPaths = cutPaths.map((p) => resolver.join(p, 'node_modules'));

      // include the engine modules dir itself
      joinedPaths.push(targetEngineModules);

      const fs = resolver.fileSystem;
      forEachBail(joinedPaths, (addr, callback) => {
        fs.stat(resolver.join(addr, packageName), (err, stat) => {
          if (err || !stat || !stat.isDirectory()) {
            return callback();
          }

          const obj = {
            ...request,
            path: addr,
            request: `./${request.request}`,
          };

          return resolver.doResolve(target, obj, `modules in ${addr}`, resolveContext, callback);
        });
      }, callback);
    });
  }
};
