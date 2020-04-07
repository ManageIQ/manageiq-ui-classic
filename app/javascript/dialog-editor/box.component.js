// behaviour for the boxes inside of the dialogs tabs.
export const Box = {
  bindings: {
    setupModalOptions: '&',
  },
  controller: BoxController,
  controllerAs: 'vm',
  template: require('./box.html'),
};
