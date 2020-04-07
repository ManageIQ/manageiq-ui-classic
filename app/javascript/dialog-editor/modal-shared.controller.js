export class ModalSharedController {
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

ModalSharedController.$inject = ['DialogEditor'];
