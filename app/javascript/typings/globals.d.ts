import { IModule } from 'angular';
import { ReduxApi } from '../miq-redux/redux-typings';
import { ComponentApi } from '../miq-component/component-typings';

interface MiqAngular {
  app: IModule;
}

declare global {

  /**
   * `ManageIQ` runtime global, holding application-specific objects.
   */
  namespace ManageIQ {
    const angular: MiqAngular;
    let redux: ReduxApi;
    let component: ComponentApi;
  }

  /**
   * Truthy value means the code runs in a test environment.
   */
  const __testing__: boolean;

}
