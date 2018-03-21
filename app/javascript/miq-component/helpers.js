import * as registry from '../miq-component/registry';
import reactBlueprint from '../miq-component/react-blueprint';

export function addReact(name, component) {
  return registry.define(name, reactBlueprint(component));
}
