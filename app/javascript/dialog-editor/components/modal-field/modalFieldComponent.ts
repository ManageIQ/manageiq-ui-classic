import { AbstractModal, ModalController } from '../abstractModal';

/**
 * @memberof miqStaticAssets
 * @ngdoc component
 * @name dialogEditorModalField
 * @description
 *    Component contains templates for the modal for editing dialog editors
 *    field (group) details
 * @example
 * <dialog-editor-modal-field></dialog-editor-modal-field>
 */
export default class ModalField extends AbstractModal {
  public template = require('./field.html');
  public controller = ModalFieldController;
}

class ModalFieldController extends ModalController {
  public treeOptions: any;
  public modalData: any;

  public $onInit() {
    this.treeOptions = {
      ...this.treeOptions,

      show: false,
      includeDomain: false,
      data: null,

      toggle: () => {
        this.treeOptions.show = ! this.treeOptions.show;

        if (this.treeOptions.show) {
          const fqname = this.showFullyQualifiedName(this.modalData.resource_action) || null;

          this.treeOptions.load(fqname).then((data) => {
            this.treeOptions.data = data;
            this.treeOptions.selected = {fqname: '/' + fqname};
          });
        }
      },

      onSelect: (node) => {
        this.treeSelectorSelect(node, this.modalData);
      }
    };
  }

  public showFullyQualifiedName(resourceAction) {
    if (resourceAction.ae_namespace && resourceAction.ae_class && resourceAction.ae_instance) {
      return `${resourceAction.ae_namespace}/${resourceAction.ae_class}/${resourceAction.ae_instance}`;
    } else {
      return '';
    }
  }

  public treeSelectorSelect(node, elementData) {
    const fqname = node.fqname.split('/');

    if (this.treeOptions.includeDomain === false) {
      fqname.splice(1, 1);
    }

    elementData.resource_action = {
      ...elementData.resource_action,
      ae_instance: fqname.pop(),
      ae_class: fqname.pop(),
      ae_namespace: fqname.filter(String).join('/'),
    };

    this.treeOptions.show = false;
  }
}
