/**
 * Proxy writes to properties of the given object.
 */
export function writeProxy(object, onWrite) {
  return new Proxy(object, {
    set(target, prop, value) {
      target[prop] = value;
      onWrite(prop, value);
      return true;
    },
  });
}

/**
 * Prevent access to existing instance properties except for `id`.
 */
export function lockInstanceProperties(instance) {
  const descriptors = {};

  Object.keys(instance)
    .filter((propName) => propName !== 'id')
    .forEach((propName) => {
      descriptors[propName] = {
        get() {
          throw new Error(`Tried to read property ${propName} of destroyed instance ${instance.id}`);
        },
        set() {
          throw new Error(`Tried to write property ${propName} of destroyed instance ${instance.id}`);
        },
        enumerable: true,
      };
    });

  return Object.defineProperties(instance, descriptors);
}
