import * as registry from './registry.js';
import reactBlueprint from './react-blueprint.jsx';

export function addReact(name, component, options = {}) {
  return registry.define(name, reactBlueprint(component), options);
}

export function componentFactory(blueprintName, selector, props) {
  const { isDefined } = ManageIQ.component;
  if (!isDefined(blueprintName)) {
    throw new Error(`Attempt to create instance of ${blueprintName}. Blueprint ${blueprintName} is not defined!`);
  }
  const element = document.querySelector(selector);
  const allProps = { ...element.dataset, ...props };
  ManageIQ.component.newInstance(blueprintName, allProps, element);
}

export function getReact(name) {
  return registry.getDefinition(name).blueprint.component;
}

/**
 * @description Removes lingering React components in the virtual DOM
 * if mounting element with generated ID is no longer in actual DOM,
 * instance is destroyed and removed from virtual DOM
 */
export function cleanVirtualDom() {
  registry.getComponentNames().forEach(name =>
    registry.getComponentInstances(name).forEach((instance) => {
      if (!document.getElementById(instance.elementId)) {
        instance.destroy();
      }
    }));
}
