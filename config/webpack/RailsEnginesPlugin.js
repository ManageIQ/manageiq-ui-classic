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
    const rootCandidates = Object.keys(this.engines)
      .filter((engine) => path.startsWith(this.engines[engine].root));

    const moduleCandidates = Object.keys(this.engines)
      .filter((engine) => path.startsWith(this.engines[engine].node_modules));

    const pathLength = (path) => (path.match(/\//g) || []).length;

    rootCandidates.sort((a, b) => {
      const aLen = pathLength(this.engines[a].root);
      const bLen = pathLength(this.engines[b].root);

      return bLen - aLen;
    });

    moduleCandidates.sort((a, b) => {
      const aLen = pathLength(this.engines[a].node_modules);
      const bLen = pathLength(this.engines[b].node_modules);

      return bLen - aLen;
    });

    return moduleCandidates[0] || rootCandidates[0];
  }

  apply(resolver) {
    const target = resolver.ensureHook(this.target);

    resolver.getHook(this.source).tapAsync("RailsEnginesPlugin", (request, resolveContext, callback) => {
      const engine = this.pathToEngine(request.path);
      const engineModules = this.engines[engine].node_modules;
      const inNodeModules = request.path.startsWith(engineModules);
      const packageName = request.request.split('/')[0];
      let targetEngineModules = engineModules;

      if (! engine) {
        throw `RailsEnginesPlugin: no engine found for ${request.path} ${request.request}`;
      }

      if (this.shared.packages.includes(packageName)) {
        targetEngineModules = this.shared.root;
      }

      if (! inNodeModules) {
        const obj = {
          ...request,
          path: targetEngineModules,
          request: `./${request.request}`,
        };

        resolver.doResolve(target, obj, `engine ${engine}`, resolveContext, callback);
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
