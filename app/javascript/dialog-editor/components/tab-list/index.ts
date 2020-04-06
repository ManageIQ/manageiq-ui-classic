import TabList from './tabListComponent';

export default (module: ng.IModule) => {
  module.component('dialogEditorTabs', new TabList);
};
