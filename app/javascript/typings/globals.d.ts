import { IModule } from 'angular';
import { ComponentApi } from '../miq-component/component-typings';
import { ReduxApi } from '../miq-redux/redux-typings';
import 'jasmine';

interface MiqAngular {
  app: IModule;
  rxSubject: any;
}

declare global {
  type msgType = 'error' | 'warn' | 'warning' | 'info' | 'success';

  function __(translate: string);
  const angular: any;

  /**
   * `ManageIQ` runtime global, holding application-specific objects.
   */
  namespace ManageIQ {
    const angular: MiqAngular;
    let component: ComponentApi;
    let redux: ReduxApi; // initialized by miq-redux pack
    const gridChecks: any[];
    const record: any;
  }

  function add_flash(msg: string, type: msgType, options?: any);

  // Truthy value means the code runs in a test environment.
  const __testing__: boolean;
}
