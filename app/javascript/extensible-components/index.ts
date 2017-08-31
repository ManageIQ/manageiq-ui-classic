import { IExtensionComponent, IMiQApiCallback } from './lib';

/**
 * Class for easy creation of extensible component.
 */
export class ExtensibleComponent {
  public unsubscribe: Function;
  constructor(public name: string, public api: IMiQApiCallback, public render: IMiQApiCallback){}
}

/**
 * Create new object which will hold extension components on MiQ main object.
 */
ManageIQ.extensionComponents = ManageIQ.extensionComponents || {};

/**
 * Subject from from Rxjs to send message that we want to register new component.
 */
ManageIQ.extensionComponents.source = new Rx.Subject();

/**
 * Components will be saved in items which will be set. To easy remove of components which no longer exists.
 */
ManageIQ.extensionComponents.items = new Set();

/**
 * Helper function to create new component.
 * @param name string name of new component.
 * @param api callback functions to change inner logic of component.
 * @param render callback function to apply render functions.
 */
ManageIQ.extensionComponents.newComponent = function(name: string, api?: IMiQApiCallback, render?: IMiQApiCallback) {
  let newCmp = new ExtensibleComponent(name, api, render);
  ManageIQ.extensionComponents.source.onNext({action: 'add', payload: newCmp});
  return newCmp;
}

/**
 * Subscribe to extensionComponents source to add new components to items object.
 */
ManageIQ.extensionComponents.source.subscribe((event: IExtensionComponent) => {
  if (event.action === 'add' && event.hasOwnProperty('payload')) {
    event.payload.unsubscribe = () => {
      ManageIQ.extensionComponents.items.delete(event.payload);
    }
    ManageIQ.extensionComponents.items.add(event.payload);
  } else {
    throw new Error('Unsupported action with extension components.');
  }
});

ManageIQ.extensionComponents.subscribe = function(cmpName: string) {
  let unsubscribe;
  return {
    with: (callback) => {
      unsubscribe = ManageIQ.extensionComponents.source
        .map(sourceAction => sourceAction.action === 'add' ? sourceAction.payload : {})
        .filter(component => component && component.name === cmpName)
        .subscribe(cmp => cmp && callback(cmp));

      ManageIQ.extensionComponents.items.forEach((component) => {
        component.name === cmpName && callback(component);
      });
    },
    delete: () => unsubscribe && unsubscribe()
  }
}
