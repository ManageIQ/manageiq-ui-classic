import * as registry from '../miq-component/registry';
import reactBlueprint from '../miq-component/react-blueprint';

export function addReact(name, component) {
  return registry.define(name, reactBlueprint(component));
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
