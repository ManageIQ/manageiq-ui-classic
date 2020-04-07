// behaviour for the tabs inside of the dialogs.
export const TabList = {
  bindings: {
    setupModalOptions: '&',
  },
  controller: TabListController,
  controllerAs: 'vm',
  template: require('./tab-list.html'),
};
