import { AbstractModal } from '../abstractModal';

/**
 * @description
 *    Component contains templates for the modal for editing dialog editors
 *    box (group) details
 * @example
 * <dialog-editor-modal-box></dialog-editor-modal-box>
 */
export default class ModalBoxTemplate extends AbstractModal {
  template = require('./box.html');
}
