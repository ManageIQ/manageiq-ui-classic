import { Injectable } from '@angular/core';
function _window() : any {
  // return the global native browser window object
  return window;
}
@Injectable()
/**
 * Give us access to native 'window' object.
 */
export class WindowService {
  get nativeWindow() : any {
    return _window();
  }
}
