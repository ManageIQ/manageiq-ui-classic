import services from './services';
import components from './components';

import editModal from './edit-modal/';
import './styles/index.scss';

export const app = angular.module('miq.dialogEditor', [
  'frapontillo.bootstrap-switch',
  'miqStaticAssets.miqSelect',
  'ngDragDrop',
  'ui.sortable',
]);

services(app);
components(app);

editModal(app);
