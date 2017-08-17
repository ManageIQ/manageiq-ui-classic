import * as ng from 'angular';
import {getStore, addReducer, applyReducerHash} from '../../miq-redux/lib';
import {AppState, Action} from '../../packs/miq-redux';
import {MiqStore} from '../../packs/miq-redux';
import {INIT_NEW_PROVIDER, reducers, UPDATE_NEW_PROVIDER} from './new-provider-reducer';

export default class NewProviderForm implements ng.IComponentOptions {
    public templateUrl: string = '/static/middleware/new-provider.html.haml';
    public controller: any = NewProviderController;
    public controllerAs: string = 'newProv';
    public bindings: any = {
        formFieldsUrl: '@',
        novalidate: '@',
        createUrl: '@'
    };
}

class NewProviderController {
    public componentState: Object;
    public newProviderName: string;
    private formFieldsUrl: string;
    private novalidate: boolean;
    private createUrl: string;
    private reduxStore: MiqStore;
    private unbind: any = {};

    constructor() {
        this.unbind.reducer = addReducer((state: AppState, action: Action) => {
            return applyReducerHash(reducers, state, action)
        });
        this.reduxStore = getStore();
        this.unbind.redux = this.reduxStore.subscribe(() => {
            const currState: any = this.reduxStore.getState();
            this.newProviderName = currState.providers.middleware.hawkular.newProvider.name;
        });
    }

    public $onInit() {
        this.reduxStore.dispatch({type: INIT_NEW_PROVIDER});
    }

    public onNameChanged(providerName) {
        this.reduxStore.dispatch({type: UPDATE_NEW_PROVIDER, payload: 
            {
                name: providerName
            }
        });
    }

    public $onDestroy() {
        this.unbind.redux();
        this.unbind.reducer();
    }
}
