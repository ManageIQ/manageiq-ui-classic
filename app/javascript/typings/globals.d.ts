import { IModule } from 'angular';

import { ReduxApi } from '../miq-redux/redux-typings';

interface MiqAngular {
  app: IModule;
}

declare global {

  /**
   * `ManageIQ` runtime global, holding application-specific objects.
   */
  namespace ManageIQ {
    const angular: MiqAngular;
    let redux: ReduxApi; // initialized by miq-redux pack
  }

  /**
   * This global is available when running tests with Jasmine.
   */
  const jasmine: any;

}
