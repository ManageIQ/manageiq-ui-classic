export class ModalController {
  uibModalInstance;
  saveModal;

  constructor(DialogEditor) {
    this.DialogEditor = DialogEditor;
  }

  closeModal(save) {
    if (save) {
      this.saveModal();
    }
    this.uibModalInstance.close();
  }
}

ModalController.$inject = ['DialogEditor'];

export class AbstractModal {
  controller = ModalController;
  controllerAs = 'vm';
  bindings = {
    modalData: '=',
    elementInfo: '<',
    categories: '=?',
    addEntry: '=?',
    removeEntry: '=?',
    currentCategoryEntries: '=?',
    setupCategoryOptions: '=?',
    updateDialogFieldResponders: '=?',
    resolveCategories: '=?',
    modalTabIsSet: '<',
    modalTabSet: '<',
    modalTab: '=',
    saveModal: '<',
    uibModalInstance: '<',
    treeOptions: '<',
  };
}
