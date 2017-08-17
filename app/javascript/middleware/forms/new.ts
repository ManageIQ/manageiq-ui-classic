import * as ng from 'angular';

export default class NewProviderForm implements ng.IComponentOptions {
    public templateUrl: string = '/static/middleware/new-provider.html';
    public controller: any = NewProviderController;
    public controllerAs: string = 'newProv';
    public replace = true;
    public bindings: any = {
        formFieldsUrl: '<',
        novalidate: '<'
    };
}

class NewProviderController {
}