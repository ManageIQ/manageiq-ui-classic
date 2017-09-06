import { IExtensionComponent, IMiQApiCallback, IMiQRenderCallback } from './lib';

const source = new Rx.Subject();
const items = new Set();

/**
 * Class for easy creation of extensible component.
 */
export class ExtensibleComponent {
  public delete: () => void;
  constructor(public name: string, public api: IMiQApiCallback, public render: IMiQRenderCallback){}
}

/**
 * Helper function to create new component.
 * @param name string name of new component.
 * @param api callback functions to change inner logic of component.
 * @param render callback function to apply render functions.
 */
function addComponent(name: string, api?: IMiQApiCallback, render?: IMiQRenderCallback) {
  let newCmp = new ExtensibleComponent(name, api, render);
  source.onNext({action: 'add', payload: newCmp});
  return newCmp;
}

/**
 * Helper function to subscribe to extension items based on component's name.
 * @param cmpName name of component we want to subscribe to.
 * @return object which has with and unsubscribe property. With is for callback to use found component and delete to
 * unsubscribe from rxjs subject.
 */
function subscribe(cmpName: string) {
  let unsubscribe;
  return {
    with: (callback) => {
      unsubscribe = source
        .map(sourceAction => sourceAction.action === 'add' ? sourceAction.payload : {})
        .filter(component => component && component.name === cmpName)
        .subscribe(cmp => cmp && callback(cmp));

      ManageIQ.extensions.items.forEach((component) => {
        component.name === cmpName && callback(component);
      });
    },
    delete: () => unsubscribe && unsubscribe.dispose()
  }
}

const extensions = {
  addComponent,
  subscribe,
  get items() { return items; }
}

ManageIQ.extensions = ManageIQ.extensions || extensions;

/**
 * Subscribe to extensions source to add new components to items object.
 */
source.subscribe((component: IExtensionComponent) => {
  if (component.action === 'add' && component.hasOwnProperty('payload')) {
    component.payload.delete = () => ManageIQ.extensions.items.delete(component.payload);
    ManageIQ.extensions.items.add(component.payload);
  } else {
    console.error('Unsupported action with extension components.');
  }
});
