export type RenderCallback = (element: HTMLElement) => void;

export interface IExtensionComponent {
  action: string;
  payload: any;
}

export interface IMiQApiCallback {
  [propName: string]: Function;
}

export interface IMiQRenderCallback {
  [propName: string]: (renderCallback: RenderCallback) => void;
}

export interface IExtensibleComponent {
  extensibleComponent: any;
  apiCallbacks: () => IMiQApiCallback;
  renderCallbacks: () => IMiQRenderCallback;
}

export function getItems() {
  return ManageIQ.extensions.items;
}

export function subscribe(cmpName: string) {
  return ManageIQ.extensions.subscribe(cmpName);
}

/**
 * Helper function to create new component.
 * @param name string name of new component.
 * @param api callback functions to change inner logic of component.
 * @param render callback function to apply render functions.
 */
export function addComponent(name: string, api?: IMiQApiCallback, render?: IMiQApiCallback) {
  return ManageIQ.extensions.addComponent(name, api, render);
}
