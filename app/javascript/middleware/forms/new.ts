import * as ng from 'angular';
import { reducers } from './new-provider-reducer';
import { DefaultFormController, IFormController } from '../../forms-common/defaultFormController';
import { 
  IExtensibleComponent,
  IMiQApiCallback,
  RenderCallback,
  IMiQRenderCallback,
  addComponent
} from '../../extensible-components/lib';
import { ExtensibleComponent } from '../../extensible-components';

export default class NewProviderForm implements ng.IComponentOptions {
  public templateUrl: string = '/static/middleware/new-provider.html.haml';
  public controller: any = NewProviderController;
  public controllerAs: string = 'newProv';
  public bindings: any = {
    types: '<',
    zones: '<',
    formFieldsUrl: '@',
    novalidate: '@',
    createUrl: '@'
  };
}

class NewProviderController extends DefaultFormController implements IFormController, IExtensibleComponent {
  public extensibleComponent: ExtensibleComponent;
  public zones: any;
  public types: any[];
  public formObject: any;
  private formFieldsUrl: string;
  private novalidate: boolean;
  private createUrl: string;
  private selects: NodeListOf<HTMLSelectElement>;
  public protocols = [
    ['<Choose>', undefined],
    ['SSL', 'ssl-with-validation'],
    ['SSL trusting custom CA', 'ssl-with-validation-custom-ca'],
    ['SSL without validation', 'ssl-with-validation'],
    ['Non-SSL', 'non-ssl'],
  ];

  public static $inject = ['$element', '$scope', '$timeout'];

  constructor(private $element: Element, private $scope: ng.IScope, private $timeout: ng.ITimeoutService) {
    super(reducers);
    this.extensibleComponent = addComponent('new-provider-hawkular', this.apiCallbacks(), this.renderCallbacks());
  }

  public updateFormObject() {
    const currState: any = this.reduxStore.getState();
    this.formObject = { ...currState.providers.middleware.hawkular.newProvider };
    this.refreshItems();
  }

  public refreshItems() {
    this.$timeout(() => {
      this.$scope.$apply();
      (<any>angular.element(this.selects)).selectpicker('refresh');
    });
  }

  public $onInit() {
    super.$onInit();
    this.selects = this.$element.querySelectorAll('select');
  }

  public $onDestroy() {
    super.$onDestroy();
    this.extensibleComponent.delete();
  }

  public apiCallbacks(): IMiQApiCallback {
    return {}
  }

  public renderCallbacks(): IMiQRenderCallback {
    return {
      newFieldsElement: (renderCallback) => this.newField(renderCallback)
    }
  }

  private newField(renderCallback: RenderCallback) {
    this.$timeout(() => renderCallback(angular.element(this.$element).find('.form-group.additional-fields')[0]));
  }
}
