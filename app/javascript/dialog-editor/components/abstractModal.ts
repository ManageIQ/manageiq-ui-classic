import * as _ from 'lodash';

export class ModalController {
  private uibModalInstance: any;
  private saveModal: any;

  /*@ngInject*/
  constructor(private DialogEditor: any) {
  }

  public closeModal(save: boolean) {
    if (save) {
      this.saveModal();
    }
    this.uibModalInstance.close();
  }
}

export class AbstractModal {
  public controller = ModalController;
  public controllerAs: string = 'vm';
  public bindings: any = {
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
