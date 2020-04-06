export default {
  template: require('./validation.html'),
  bindings: {
    modalData: '<',
  },
  controller: function() {
    this.$onChanges = () => {
      if (this.modalData && ! this.modalData.validator_type) {
        // prevent null or undefined being interpreted wrong by the switch
        this.modalData.validator_type = false;
      }
    };
  },
};
