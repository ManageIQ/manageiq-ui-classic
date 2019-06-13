import { writeProxy, lockInstanceProperties } from './utils';
import { cleanVirtualDom } from './helpers';

const registry = new Map(); // Map<definition, Set<instance>>

/**
 * Get definition of a component with the given `name`.
 */
export function getDefinition(name) {
  return Array.from(registry.keys()).find(definition => definition.name === name);
}

/**
 * Make sure the instance `id` is sane and cannot be changed.
 */
export function sanitizeAndFreezeInstanceId(instance, definition) {
  const id = typeof instance.id === 'string'
    ? instance.id
    : `${definition.name}-${registry.get(definition).size}`;

  Object.defineProperty(instance, 'id', {
    get() {
      return id;
    },
    set() {
      throw new Error(`Attempt to modify id of instance ${instance.id}`);
    },
    enumerable: true,
  });
}

/**
 * Check the following:
 * - the given instance isn't already in the registry
 * - the given instance `id` isn't already taken
 */
export function validateInstance(instance, definition) {
  if (Array.from(registry.get(definition)).find(existingInstance => existingInstance === instance)) {
    throw new Error('Instance already present, check your blueprint.create implementation');
  }
  if (getInstance(definition.name, instance.id)) {
    throw new Error(`Instance with id ${instance.id} already present`);
  }
}

/**
 * Implementation of the `ComponentApi.define` method.
 */
export function define(name, blueprint = {}, instances = null) {
  // validate inputs
  if (typeof name !== 'string' || isDefined(name)) {
    return;
  }

  // add new definition to the registry
  const newDefinition = { name, blueprint };
  registry.set(newDefinition, new Set());

  // add existing instances to the registry
  if (Array.isArray(instances)) {
    instances.filter((instance) => !!instance)
      .forEach((instance) => {
        sanitizeAndFreezeInstanceId(instance, newDefinition);
        validateInstance(instance, newDefinition);
        registry.get(newDefinition).add(instance);
      });
  }
}

/**
 * Implementation of the `ComponentApi.newInstance` method.
 */
export function newInstance(name, initialProps = {}, mountTo = null) {
  // clean all left over components
  cleanVirtualDom();
  // validate inputs
  const definition = getDefinition(name);
  if (!definition) {
    return;
  }

  // check if the blueprint supports instance creation
  const blueprint = definition.blueprint;
  if (typeof blueprint.create !== 'function') {
    return;
  }

  // multiple props modifications will trigger single instance update
  let newPropsForUpdate = {};
  function handlePropUpdate(propName, value) {
    if (typeof blueprint.update !== 'function') {
      return;
    }

    if (Object.keys(newPropsForUpdate).length === 0) {
      setTimeout(() => {
        newInstance.update(newPropsForUpdate);
        newPropsForUpdate = {};
      });
    }
    newPropsForUpdate[propName] = value;
  }

  // proxy props to handle instance update upon props modification
  let actualProps = writeProxy(Object.assign({}, initialProps), handlePropUpdate);

  // create new instance
  let newInstance = blueprint.create(actualProps, mountTo);
  if (!newInstance) {
    throw new Error(`blueprint.create returned falsy value when trying to instantiate ${name}`);
  }

  // make sure the instance id is sane and cannot be changed
  sanitizeAndFreezeInstanceId(newInstance, definition);

  // validate the instance
  validateInstance(newInstance, definition);

  // provide access to current props
  Object.defineProperty(newInstance, 'props', {
    get() {
      return actualProps;
    },
    set() {
      throw new Error(`Attempt to rewrite props associated with instance ${newInstance.id}`);
    },
    enumerable: true,
    configurable: true,
  });

  // provide instance update method
  newInstance.update = (newProps) => {
    if (typeof blueprint.update !== 'function') {
      return;
    }

    // update current props and delegate to blueprint
    actualProps = writeProxy(Object.assign({}, actualProps, newProps), handlePropUpdate);
    blueprint.update(actualProps, mountTo);
  };

  // provide instance destroy method
  newInstance.destroy = () => {
    // delegate to blueprint
    if (typeof blueprint.destroy === 'function') {
      blueprint.destroy(newInstance, mountTo);
    }

    // remove instance from the registry
    registry.get(definition).delete(newInstance);

    // prevent access to existing instance properties except for id
    lockInstanceProperties(newInstance);

    // clear instance reference
    newInstance = null;
  };

  // add instance to the registry
  registry.get(definition).add(newInstance);

  return newInstance;
}

/**
 * Implementation of the `ComponentApi.getInstance` method.
 */
export function getInstance(name, id) {
  const definition = getDefinition(name);
  return definition && Array.from(registry.get(definition)).find(instance => instance.id === id);
}

/**
 * Implementation of the `ComponentApi.isDefined` method.
 */
export function isDefined(name) {
  return !! getDefinition(name);
}

/**
 * Test helper: get names of all components.
 */
export function getComponentNames() {
  return Array.from(registry.keys()).map(definition => definition.name);
}

/**
 * Test helper: get all instances of the given component.
 */
export function getComponentInstances(name) {
  const definition = getDefinition(name);
  return definition ? Array.from(registry.get(definition).values()) : [];
}

/**
 * Test helper: remove all component data.
 */
export function clearRegistry() {
  registry.clear();
}
