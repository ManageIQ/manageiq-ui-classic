import * as _ from 'lodash';

/**
 * Controller for the Dialog Editor Modal Field Template component
 * @ngdoc controller
 * @name ModalFieldController
 */
class ModalFieldController {
  public modalData: any;
  public sortableOptionsValues: any;
  public readonly DROPDOWN_ENTRY_VALUE: number = 0;
  public readonly DROPDOWN_ENTRY_DESCRIPTION: number = 1;

  /*@ngInject*/
  constructor(private $scope,
              private $element: any) {
    // Rules for Drag&Drop sorting of values in a Dropdown element
    this.sortableOptionsValues = {
      axis: 'y',
      cancel: 'input',
      delay: 100,
      cursor: 'move',
      opacity: 0.5,
      revert: 50,
      stop: (e: any, ui: any) => {
        this.$element.find('select').selectpicker('refresh');
      },
    };
  }

  public $onChanges(changesObj) {
    if (changesObj.modalData && changesObj.modalData.default_value === []) {
      this.modalData.default_value = '';
    }
  }

  public entriesChange() {
    setTimeout(() => this.$element.find('select').selectpicker('refresh'));
  }
}

/**
 * @memberof miqStaticAssets
 * @ngdoc component
 * @name dialogEditorModalFieldTemplate
 * @description
 *    Component contains templates for the modal for each field type
 * @example
 * <dialog-editor-modal-field-template ng-switch-when="DialogFieldTextBox"
 *                                     template="text-box.html"
 *                                     modal-data="vm.modalData">
 * </dialog-editor-modal-field-template>
 */
export default class ModalFieldTemplate {
  /*@ngInject*/
  public template = ($element: any, $attrs: any) => require(`./${$attrs.template}`);
  public scope: boolean = true;
  public controller = ModalFieldController;
  public controllerAs: string = 'vm';
  public bindings: any = {
    modalData: '=',
    categories: '=?',
    addEntry: '=?',
    removeEntry: '=?',
    currentCategoryEntries: '=?',
    setupCategoryOptions: '=?',
    resolveCategories: '=?',
    modalTabIsSet: '<',
    modalTab: '=',
    showFullyQualifiedName: '<',
    treeOptions: '<',
  };
}
