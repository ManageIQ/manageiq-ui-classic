export class ModalFieldTemplateController {
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
      stop: (_e, _ui) => {
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

ModalFieldTemplateController.$inject = ['$element'];
