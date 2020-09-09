export class ModalController {
  modalTab = 'element_information';

  constructor($uibModal, DialogEditor, DialogEditorHttp) {
    this.$uibModal = $uibModal;
    this.DialogEditor = DialogEditor;
    this.DialogEditorHttp = DialogEditorHttp;
  }

  loadModalData(elem) {
    if (elem !== undefined) {
      // clone data from service
      const elements = {
        tab: this.loadModalTabData(elem.tabId),
        box: this.loadModalBoxData(elem.tabId, elem.boxId),
        field: this.loadModalFieldData(elem.tabId, elem.boxId, elem.fieldId),
      };
      this.modalData = elem.type in elements && _.cloneDeep(elements[elem.type]);

      if (elem.type === 'field') {
        this.modalData.dynamicFieldList = this.DialogEditor.getDynamicFields(this.modalData.name);

        // load categories from API, if the field is Tag Control
        if (this.modalData.type === 'DialogFieldTagControl') {
          this.resolveCategories().then((categories) => (this.categories = categories));
        }

        // set modal title
        if (!this.modalData.dynamic) {
          const titles = {
            DialogFieldCheckBox: __('Check Box'),
            DialogFieldDateControl: __('Datepicker'),
            DialogFieldDateTimeControl: __('Timepicker'),
            DialogFieldDropDownList: __('Dropdown'),
            DialogFieldRadioButton: __('Radio Button'),
            DialogFieldTagControl: __('Tag Control'),
            DialogFieldTextAreaBox: __('Text Area'),
            DialogFieldTextBox: __('Text Box'),
          };

          const titleLabel = this.modalData.type in titles && titles[this.modalData.type];
          this.modalTitle = sprintf(__('Edit %s Field'), titleLabel);
        }
      }
    }
  }

  loadModalTabData(tab) {
    if (typeof tab === 'undefined') {
      return null;
    }

    const tabList = this.DialogEditor.getDialogTabs();
    return tabList[tab];
  }

  loadModalBoxData(tab, box) {
    if (typeof tab === 'undefined' || typeof box === 'undefined') {
      return null;
    }

    const tabList = this.DialogEditor.getDialogTabs();
    const boxList = tabList[tab];
    return boxList.dialog_groups[box];
  }

  loadModalFieldData(tab, box, field) {
    if (typeof tab === 'undefined' || typeof box === 'undefined' || typeof field === 'undefined') {
      return null;
    }

    const tabList = this.DialogEditor.getDialogTabs();
    const boxList = tabList[tab];
    const fieldList = boxList.dialog_groups[box];
    return fieldList.dialog_fields[field];
  }

  // Load categories data from API.
  resolveCategories() {
    return this.DialogEditorHttp.loadCategories();
  }

  // Store the name of the tab, that is currently selected.
  modalTabSet(tab) {
    this.modalTab = tab;
  }

  // Watches 'modalOptions' for changes, displays modal when it does
  $onChanges(changesObj) {
    if (changesObj.modalOptions && this.modalOptions) {
      this.showModal(this.modalOptions);
    }
  }

  // true/false according to which tab is currently selected in the modal.
  modalTabIsSet(tab) {
    return this.modalTab === tab;
  }

  // Check for changes in the modal.
  modalUnchanged() {
    const elements = {
      tab: this.DialogEditor.getDialogTabs()[this.DialogEditor.activeTab],
      box: this.DialogEditor.getDialogTabs()[this.DialogEditor.activeTab]
        .dialog_groups[this.elementInfo.boxId],
      field: this.DialogEditor.getDialogTabs()[this.DialogEditor.activeTab]
        .dialog_groups[this.elementInfo.boxId]
        .dialog_fields[this.elementInfo.fieldId],
    };
    return this.elementInfo.type in elements && _.isMatch(elements[this.elementInfo.type], this.modalData);
  }

  // Store modified data back to the service.
  saveDialogFieldDetails() {
    const tab = this.DialogEditor.getDialogTabs()[this.DialogEditor.activeTab];
    switch (this.elementInfo.type) {
      case 'tab':
        _.extend(tab, {
          label: this.modalData.label,
          description: this.modalData.description,
        });
        break;
      case 'box':
        _.extend(tab.dialog_groups[this.elementInfo.boxId], {
          label: this.modalData.label,
          description: this.modalData.description,
        });
        break;
      case 'field':
        tab.dialog_groups[this.elementInfo.boxId].dialog_fields[this.elementInfo.fieldId] = this.modalData;
        break;
      default:
        break;
    }

    this.DialogEditor.backupSessionStorage(this.DialogEditor.getDialogId(), this.DialogEditor.data);
  }

  // Delete dialog field selected in modal.
  deleteField() {
    const tab = this.DialogEditor.getDialogTabs()[this.DialogEditor.activeTab];
    const group = tab.dialog_groups[this.elementInfo.boxId];
    _.remove(group.dialog_fields, (field) => field.position === this.elementInfo.fieldId);

    this.DialogEditor.backupSessionStorage(this.DialogEditor.getDialogId(), this.DialogEditor.data);
  }

  // Add entry for radio button / dropdown select.
  addEntry() {
    if (this.modalData.values == null) {
      this.modalData.values = [];
    }

    this.modalData.values.push(['', '']);
  }

  // Remove entry for radio button / dropdown select
  removeEntry(entry) {
    _.pull(this.modalData.values, entry);
  }

  // Finds entries for the selected category.
  currentCategoryEntries() {
    if (!angular.isDefined(this.categories)) {
      return null;
    }

    return _.find(this.categories.resources, {
      id: this.modalData.options.category_id,
    });
  }

  // Updates fields associated with dynamic fields after changing the dynamic field to static
  updateDialogFieldResponders(changedFieldName) {
    this.DialogEditor.forEachDialogField((field) => {
      if (!field.dialog_field_responders
        || !field.dialog_field_responders.includes(changedFieldName)) {
        return;
      }

      const index = field.dialog_field_responders.indexOf(changedFieldName);
      field.dialog_field_responders.splice(index, 1);
    });
  }

  // Finds entries for the selected TagControl and sets them.
  setupCategoryOptions() {
    const vm = this;
    const item = this.modalData.options.category_id;
    this.categories.resources.forEach((name) => {
      if (name.id === item) {
        vm.modalData.options.category_description = name.description;
        vm.modalData.options.category_name = name.name;
        vm.modalData.options.category_single_value = name.single_value;
      }
    });
  }

  // display the right modal
  showModal(options) {
    options.controller = ['parent', function(parent) { this.parent = parent; }];
    options.resolve = {
      parent: () => this,
    };
    options.controllerAs = 'modalCtrl';
    options.template = ModalController.buildTemplate(options.component);
    this.modalTab = 'element_information';
    this.loadModalData(this.elementInfo);
    this.uibModalInstance = this.$uibModal.open(options);
    return this.uibModalInstance.result.catch(() => undefined);
  }

  // Building the modal component template.
  // New component automatically has access to any of these bindings
  // and if a new one is needed, it should be added here to be available.
  static buildTemplate(component) {
    return `<${component}
      modal-data="modalCtrl.parent.modalData"
      element-info="modalCtrl.parent.elementInfo"
      categories="modalCtrl.parent.categories"
      add-entry="modalCtrl.parent.addEntry"
      remove-entry="modalCtrl.parent.removeEntry"
      current-category-entries="modalCtrl.parent.currentCategoryEntries"
      resolve-categories="modalCtrl.parent.resolveCategories"
      modal-tab-is-set="modalCtrl.parent.modalTabIsSet"
      modal-tab-set="modalCtrl.parent.modalTabSet"
      modal-tab="modalCtrl.parent.modalTab"
      save-modal="modalCtrl.parent.saveDialogFieldDetails"
      uib-modal-instance="modalCtrl.parent.uibModalInstance"
      tree-options="modalCtrl.parent.treeOptions"
      update-dialog-field-responders="modalCtrl.parent.updateDialogFieldResponders"
      setup-category-options="modalCtrl.parent.setupCategoryOptions"
      ></${component}>`;
  }
}

ModalController.$inject = [
  '$uibModal',
  'DialogEditor',
  'DialogEditorHttp',
];
