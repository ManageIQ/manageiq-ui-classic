import React from 'react';
import forEach from 'lodash/forEach';
import map from 'lodash/map';

const componentRegistry = {
  registry: {},

  register({
    name = null, type = null, store = true, data = true,
  }) {
    if (!name || !type) {
      throw new Error('Component name or type is missing');
    }
    if (this.registry[name]) {
      throw new Error(`Component name already taken: ${name}`);
    }

    this.registry[name] = { type, store, data };
    return this.registry;
  },

  registerMultiple(componentObjs) {
    return forEach(componentObjs, obj => this.register(obj));
  },

  getComponent(name) {
    return this.registry[name];
  },

  registeredComponents() {
    return map(this.registry, (value, key) => key).join(', ');
  },

  markup(name, data, store) {
    const currentComponent = this.getComponent(name);

    if (!currentComponent) {
      throw new Error(`Component not found:  ${name} among ${this.registeredComponents()}`);
    }
    const ComponentName = currentComponent.type;

    return (
      <ComponentName
        data={currentComponent.data ? data : undefined}
        store={currentComponent.store ? store : undefined}
      />
    );
  },
};

const coreComponets = [];

componentRegistry.registerMultiple(coreComponets);

export default componentRegistry;
