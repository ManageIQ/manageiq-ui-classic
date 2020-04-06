import services from './services';
import components from './components';
import './styles/index.scss';

export const app = angular.module('miq.dialogEditor', [
  'frapontillo.bootstrap-switch',
  'miqStaticAssets.miqSelect',
  'ngDragDrop',
  'ui.sortable',
]);

services(app);
components(app);
