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
  controller: ModalFieldController,
  controllerAs: 'vm',
  scope: true,
  template: ['$attrs', ($attrs) => require(`./modal-field-template/${$attrs.template}`)],
};
