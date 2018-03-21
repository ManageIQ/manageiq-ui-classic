import { IModule } from 'angular';
import { ComponentApi } from '../miq-component/component-typings';
import { ReduxApi } from '../miq-redux/redux-typings';

interface MiqAngular {
  app: IModule;
}

declare global {
  // `ManageIQ` runtime global, holding application-specific objects.
  namespace ManageIQ {
    const angular: MiqAngular;
    let component: ComponentApi;
    let redux: ReduxApi;
  }

  // This global is available when running tests with Jasmine.
  const jasmine: any;

  // Truthy value means the code runs in a test environment.
  const __testing__: boolean;
}
