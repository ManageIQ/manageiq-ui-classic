import * as ng from 'angular';

export default class NewProviderForm implements ng.IComponentOptions {
    public template: string = `<div>blablabla</div>`;
    public controller: any = NewProviderController;
    public controllerAs: string = 'newProv';
    public replace = true;
    public bindings: any = {};
}

class NewProviderController {
    constructor() {
        console.log('blaaaa');
    }
}