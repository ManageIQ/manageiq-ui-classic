import { TabsController } from './tabs.controller.js';

// behaviour for the tabs inside of the dialogs.
export const Tabs = {
  bindings: {
    setupModalOptions: '&',
  },
  controller: TabsController,
  controllerAs: 'vm',
  template: require('./tabs.html'),
};
