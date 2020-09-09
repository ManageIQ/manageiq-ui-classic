export const Validation = {
  bindings: {
    modalData: '<',
  },
  controller() {
    this.$onChanges = () => {
      if (this.modalData && !this.modalData.validator_type) {
        // prevent null or undefined being interpreted wrong by the switch
        this.modalData.validator_type = false;
      }
    };
  },
  templateUrl: '/static/dialog-editor/validation.html',
};
