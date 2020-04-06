export class ModalController {
  private uibModalInstance;
  private saveModal;

  constructor(DialogEditor) {
    this.DialogEditor = DialogEditor;
  }

  public closeModal(save) {
    if (save) {
      this.saveModal();
    }
    this.uibModalInstance.close();
  }
}

ModalController.$inject = ['DialogEditor'];

export class AbstractModal {
  public controller = ModalController;
  public controllerAs = 'vm';
  public bindings = {
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
