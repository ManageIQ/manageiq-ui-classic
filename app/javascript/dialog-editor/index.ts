import services from './services';
import components from './components';

module dialogEditor {
  export const app = angular.module('miq.dialogEditor', [
    'ui.sortable',
    'ngDragDrop',
    'frapontillo.bootstrap-switch',
    'miqStaticAssets.miqSelect',
  ]);

  services(app);
  components(app);
}
