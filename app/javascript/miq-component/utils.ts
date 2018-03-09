import { AnyComponentInstance } from './component-typings';

/**
 * Proxy writes to properties of the given object.
 */
export function writeProxy<T extends object>(
  object: T,
  onWrite: (propName, value) => void
): T {
  return new Proxy<T>(object, {
    set(target, prop, value): boolean {
      target[prop] = value;
      onWrite(prop, value);
      return true;
    }
  });
}

/**
 * Prevent access to existing instance properties except for `id`.
 */
export function lockInstanceProperties(
  instance: AnyComponentInstance
): AnyComponentInstance {
  const descriptors = {};

  Object.keys(instance)
    .filter(propName => propName !== 'id')
    .forEach(propName => {
      descriptors[propName] = {
        get() {
          throw new Error(`Tried to read property ${propName} of destroyed instance ${instance.id}`);
        },
        set() {
          throw new Error(`Tried to write property ${propName} of destroyed instance ${instance.id}`);
        },
        enumerable: true
      };
    });

  return Object.defineProperties(instance, descriptors);
}
