export interface IExtensionComponent {
  action: string;
  payload: any;
}

export interface IMiQApiCallback {
  [propName: string]: Function;
}

export interface IExtensibleComponent {
  extensibleComponent: any;
  apiCallbacks: () => IMiQApiCallback;
  renderCallbacks: () => IMiQApiCallback;
}

export const extensionSource = ManageIQ.extensionComponents.source;

export const extensionItems = ManageIQ.extensionComponents.items;

/**
 * Helper function to create new component.
 * @param name string name of new component.
 * @param api callback functions to change inner logic of component.
 * @param render callback function to apply render functions.
 */
export function newComponent(name: string, api?: IMiQApiCallback, render?: IMiQApiCallback) {
  return ManageIQ.extensionComponents.newComponent(name, api, render);
}