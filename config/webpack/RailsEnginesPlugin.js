"use strict";

const getPaths = require("enhanced-resolve/lib/getPaths");
const forEachBail = require("enhanced-resolve/lib/forEachBail");

module.exports = class RailsEnginesPlugin {
  constructor(source, target, engines) {
    this.source = source;
    this.target = target;
    this.engines = engines;
  }

  apply(resolver) {
    const target = resolver.ensureHook(this.target);

    resolver.getHook(this.source).tapAsync("RailsEnginesPlugin", (request, resolveContext, callback) => {
      const engine = Object.keys(this.engines).filter((engine) => request.path.startsWith(this.engines[engine]))[0];
      const engineRoot = this.engines[engine];
      const inNodeModules = request.path.includes('node_modules');

      if (! engine) {
        throw `RailsEnginesPlugin: no engine found for ${request.path} ${request.request}`;
      }

      if (! inNodeModules) {
        const obj = {
          ...request,
          path: `${engineRoot}/node_modules`,
          request: `./${request.request}`,
        };

        resolver.doResolve(target, obj, `engine ${engine}`, resolveContext, callback);
        return;
      }

      // only look in paths under the plugin
      const paths = getPaths(request.path).paths;
      const engineBoundary = paths.indexOf(engineRoot);

      const cutPaths = paths.slice(0, engineBoundary + 1);  // including the engine root
      const joinedPaths = cutPaths.map((p) => resolver.join(p, 'node_modules'));

      const packageName = request.request.split('/')[0];

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
