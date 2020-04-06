import { AbstractModal } from '../abstractModal';

/**
 * @memberof miqStaticAssets
 * @ngdoc component
 * @name dialogEditorModalTab
 * @description
 *    Component contains templates for the modal for editing dialog editors
 *    tab (group) details
 * @example
 * <dialog-editor-modal-tab></dialog-editor-modal-tab>
 */
export default class ModalTabTemplate extends AbstractModal {
  public template = require('./tab.html');
}
