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
import * as FormActions from './formActions';

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

  constructor(private $element: Element,
              private $scope: ng.IScope,
              private $timeout: ng.ITimeoutService) {
    super(reducers, FormActions);
    this.extensibleComponent = addComponent('new-provider-hawkular', this.apiCallbacks(), this.renderCallbacks());
  }

  public mapStateToThis(state) {
    return {
      formObject: state.providers.middleware.hawkular.newProvider
    }
  }

  public refreshForm() {
    this.$timeout(() => {
      this.$scope.$apply();
      (<any>angular.element(this.selects)).selectpicker('refresh');
    });
  }

  public $onInit() {
    this.selects = this.$element.querySelectorAll('select');
    this.refreshForm();
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
