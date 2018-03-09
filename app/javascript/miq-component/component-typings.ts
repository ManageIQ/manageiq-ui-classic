/**
 * Props are component's inputs, containing data and/or callbacks.
 *
 * Props should be treated as immutable if possible, which greatly simplifies
 * the data flow in your application, making it easier to understand and change.
 */
export interface ComponentProps {
  [key: string]: any;
}

/**
 * Represents a single instance of the underlying technology specific component.
 */
export interface BasicComponentInstance {

  /**
   * Instance `id` is used to distinguish between individual component instances.
   *
   * Instance `id` must be unique across all instances of the given component.
   * Attempts to create new instances with an already taken `id` will throw an
   * error.
   *
   * If not defined or not a string, the value will be auto-generated as part of
   * the `newInstance` method.
   */
  id?: string;

  /**
   * Interface for component interaction.
   *
   * The value is entirely component specific and optional.
   */
  interact?: any;

}

/**
 * Component instance created through (and managed by) the component API.
 */
export interface ManagedComponentInstance extends BasicComponentInstance {

  /**
   * Current component props.
   *
   * The value is initialized based on the `initialProps` parameter. Every time
   * `instance.update` is called, the `props` value gets updated.
   */
  props: ComponentProps;

  /**
   * Update the component instance.
   *
   * This method creates new props by merging current props with `newProps` and
   * then calls the `blueprint.update` method; any properties present in current
   * props but missing in `newProps` will be retained.
   *
   * @param newProps New props to use.
   */
  update(
    newProps: ComponentProps
  ): void;

  /**
   * Destroy and unmount the component instance.
   *
   * Once destroyed, attempts to access properties of the instance other than `id`
   * will throw an error.
   */
  destroy(
  ): void;

}

export type AnyComponentInstance = BasicComponentInstance | ManagedComponentInstance;

/**
 * Blueprint used to manage component instances.
 */
export interface ComponentBlueprint {

  /**
   * Recipe for creating new instances.
   *
   * If not defined, the `newInstance` method will have no effect for the given
   * component.
   *
   * Returning a reference to an existing component instance will cause the
   * `newInstance` method to throw an error.
   *
   * @param props Props to use when creating the component instance.
   * @param mountTo DOM element to mount the component instance to.
   *
   * @returns Object that represents the actual component instance.
   */
  create?(
    props: ComponentProps,
    mountTo?: HTMLElement
  ): BasicComponentInstance;

  /**
   * Recipe for updating instances.
   *
   * If not defined, the `instance.update` method will have no effect.
   *
   * @param newProps New props to use.
   * @param mountedTo DOM element to which the component instance is mounted.
   */
  update?(
    newProps: ComponentProps,
    mountedTo?: HTMLElement
  ): void;

  /**
   * Recipe for destroying instances.
   *
   * Component instance that was previously mounted to a DOM element should be
   * unmounted as part of this method.
   *
   * _To prevent memory leaks, components that require DOM context (have their
   * instances mounted to a DOM element upon creation) must have their blueprint
   * implement both `create` and `destroy` methods. Avoid leaky blueprints!_
   *
   * @param instance Component instance to destroy.
   * @param unmountFrom DOM element from which to unmount the component instance.
   */
  destroy?(
    instance: ManagedComponentInstance,
    unmountFrom?: HTMLElement
  ): void;

}

/**
 * `ManageIQ.component` API.
 */
export interface ComponentApi {

  /**
   * Define new component.
   *
   * Each component has a unique `name`. Attempts to define new component with
   * an already taken `name` will have no effect.
   *
   * @param name Component name.
   * @param blueprint Blueprint used to manage component instances.
   * @param instances Existing instances to associate with this component.
   */
  define(
    name: string,
    blueprint: ComponentBlueprint,
    instances?: BasicComponentInstance[]
  ): void;

  /**
   * Create new component instance and mount it to the given DOM element as
   * necessary.
   *
   * Each component must be defined before creating its instances. Attempts to
   * instantiate a component that isn't already defined will have no effect.
   *
   * This method delegates to component's blueprint. If the blueprint doesn't
   * support creating new instances (`blueprint.create`), this method will have
   * no effect.
   *
   * The `initialProps` object will be proxied in order to allow intercepting
   * writes to its properties. Calling `props.foo = newValue` on the resulting
   * props will trigger an update of the component instance. With that in mind,
   * always treat props as immutable if possible, i.e. always prefer calling
   * `instance.update` over current props modification.
   *
   * Note that the `mountTo` parameter is optional. This allows for definition
   * of components that don't require DOM context.
   *
   * _Make sure to destroy component instances once they're no longer needed to
   * prevent memory leaks._
   *
   * @param name Component name.
   * @param initialProps Initial props to use when creating the instance.
   * @param mountTo DOM element to mount the component instance to.
   *
   * @returns New component instance or `undefined` if it couldn't be created.
   */
  newInstance(
    name: string,
    initialProps: ComponentProps,
    mountTo?: HTMLElement
  ): ManagedComponentInstance | undefined;

  /**
   * Get existing component instance by its `id`.
   *
   * @param name Component name.
   * @param id Component instance `id`.
   *
   * @returns Matching component instance or `undefined` if not found.
   */
  getInstance(
    name: string,
    id: string
  ): AnyComponentInstance | undefined;

  /**
   * Check if a component with the given `name` is defined.
   *
   * @param name Component name.
   *
   * @returns `true` if the component is defined, `false` otherwise.
   */
  isDefined(
    name: string
  ): boolean;

}
