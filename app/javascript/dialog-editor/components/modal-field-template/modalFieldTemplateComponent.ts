/**
 * Controller for the Dialog Editor Modal Field Template component
 * @ngdoc controller
 * @name ModalFieldController
 */
class ModalFieldController {
  modalData;
  sortableOptionsValues;
  readonly DROPDOWN_ENTRY_VALUE = 0;
  readonly DROPDOWN_ENTRY_DESCRIPTION = 1;

  constructor($element) {
    this.$element = $element;

    // Rules for Drag&Drop sorting of values in a Dropdown element
    this.sortableOptionsValues = {
      axis: 'y',
      cancel: 'input',
      delay: 100,
      cursor: 'move',
      opacity: 0.5,
      revert: 50,
      stop: (e, ui) => {
        this.$element.find('select').selectpicker('refresh');
      },
    };
  }

  $onChanges(changesObj) {
    if (changesObj.modalData && changesObj.modalData.default_value === []) {
      this.modalData.default_value = '';
    }
  }

  entriesChange() {
    setTimeout(() => this.$element.find('select').selectpicker('refresh'));
  }
}

ModalFieldController.$inject = ['$element'];

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
  template = ['$attrs', ($attrs) => require(`./${$attrs.template}`)];
  scope = true;
  controller = ModalFieldController;
  controllerAs = 'vm';
  bindings = {
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
