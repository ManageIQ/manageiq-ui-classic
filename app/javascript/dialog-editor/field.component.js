// behaviour for the fields inside of the dialogs boxes
export const Field = {
  bindings: {
    boxPosition: '<',
    fieldData: '<',
    setupModalOptions: '&',
  },
  controller: FieldController,
  controllerAs: 'vm',
  template: require('./field.html'),
};
