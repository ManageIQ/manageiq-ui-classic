module.exports = class RailsEnginesPlugin {
  constructor(source, target, engines) {
    this.source = source;
    this.target = target;
    this.engines = engines;
  }

  apply(resolver) {
    const target = resolver.ensureHook(this.target);

    resolver.getHook(this.source).tapAsync("RailsEnginesPlugin", (request, resolveContext, callback) => {
      let obj = {
        ...request,
        railsEngine: Object.keys(this.engines).filter((engine) => request.path.startsWith(this.engines[engine]))[0],
      };

      obj.path = `${this.engines[obj.railsEngine]}/node_modules`;
      obj.request = `./${obj.request}`;
      // console.log({ path: obj.path, request: obj.request });

      resolver.doResolve(target, obj, "whatever", resolveContext, callback);
    });
  }
};
