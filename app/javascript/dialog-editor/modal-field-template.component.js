import { ModalFieldTemplateController } from './modal-field-template.controller.js';

// renders modal templates for each field type
export const ModalFieldTemplate = {
  bindings: {
    addEntry: '=?',
    categories: '=?',
    currentCategoryEntries: '=?',
    modalData: '=',
    modalTab: '=',
    modalTabIsSet: '<',
    removeEntry: '=?',
    resolveCategories: '=?',
    setupCategoryOptions: '=?',
    showFullyQualifiedName: '<',
    treeOptions: '<',
  },
  controller: ModalFieldTemplateController,
  controllerAs: 'vm',
  scope: true,
  template: ['$attrs', ($attrs) => require(`./modal-field-template/${$attrs.template}`)],
};
