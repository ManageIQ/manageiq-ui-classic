/**
 * Controller for the Dialog Editor tab list component
 * @memberof miqStaticAssets
 * @ngdoc controller
 * @name TabListController
 */
class TabListController {
  public tabList: any;
  public sortableOptions: any;
  public setupModalOptions: any;

  /*@ngInject*/
  constructor(private DialogEditor: any) {
  }

  /**
   * Activate the first tab in tab list, if there is any.
   * @memberof TabListController
   * @function onInit
   */
  public $onInit() {
    // load tabs data from the service
    this.tabList = this.DialogEditor.getDialogTabs();
    // set active tab
    if (this.tabList.length !== 0) {
      this.DialogEditor.activeTab = 0;
      this.tabList[this.DialogEditor.activeTab].active = true;
    }
    // set options for sorting tabs in list
    this.sortableOptions = {
      cancel: '.nosort',
      cursor: 'move',
      helper: 'clone',
      revert: 50,
      stop: (e: any, ui: any) => {
        let sortedTab: any = ng.element(ui.item).scope().$parent;
        let tabList = sortedTab.vm.tabList;
        this.DialogEditor.updatePositions(tabList);
        let activeTab: any = _.find(tabList, {active: true});
        this.DialogEditor.activeTab = activeTab.position;
      },
    };
  }

  /**
   * Add a new tab to the list.
   * New tab is automatically appended to the last position of the list and
   * set as active.
   * @memberof TabListController
   * @function addTab
   */
  public addTab() {
    // deactivate currently active tab
    this.tabList.forEach((tab) =>  tab.active = false);
    // create a new tab
    let nextIndex = this.tabList.length;
    this.tabList.push(
      {
        description: __('New tab ') + nextIndex,
        display: 'edit',
        label: __('New tab ') + nextIndex,
        position: nextIndex,
        active: true,
        dialog_groups: [{
          'label': __('New section'),
          'position': 0,
          'dialog_fields': [],
        }],
      }
    );
    this.DialogEditor.activeTab = nextIndex;
    this.DialogEditor.updatePositions(this.tabList);
  }

  /**
   * Delete tab and all its content from the dialog.
   * After removing tab, position attributes needs to be updated.
   * If the tab to delete is active in the moment of the deletion, the
   * activity goes to the other tab.
   * @memberof TabListController
   * @function removeTab
   * @param {number} id is an index of remove tab
   */
  public removeTab(id: number) {
    // pass the activity to other tab, if the deleted is active
    if (this.tabList[id].active) {
      if ((this.tabList.length - 1) === this.tabList[id].position &&
          (this.tabList.length - 1) !== 0) {
        // active tab was at the end → new active tab is on previous index
        this.tabList[id - 1].active = true;
      } else if ((this.tabList.length - 1) > this.tabList[id].position) {
        // active tab was not at the end → new active tab is on following index
        this.tabList[id + 1].active = true;
      }
    }
    // remove tab with matching id
    _.remove(this.tabList, (tab: any) => tab.position === id);
    this.DialogEditor.backupSessionStorage(
      this.DialogEditor.getDialogId(),
      this.DialogEditor.data);
    // update indexes of other tabs after removing
    if (this.tabList.length !== 0) {
      this.DialogEditor.updatePositions(this.tabList);
    } else {
      return;
    }
    // set activity in the service
    let activeTabData: any = _.find(
      this.tabList,
      {active: true}
    );
    if (ng.isDefined(activeTabData)) {
      this.DialogEditor.activeTab = activeTabData.position;
    }
  }

  /**
   * Assign activity to the selected tab.
   * @memberof TabListController
   * @function selectTab
   * @param {number} id is an index of remove tab
   */
  public selectTab(id: number) {
    // deactivate currently active
    let deselectedTab = _.find(
      this.tabList,
      {active: true}
    );
    deselectedTab.active = false;
    // activate selected
    let selectedTab = this.tabList[id];
    selectedTab.active = true;
    this.DialogEditor.activeTab = id;
  }
}

/**
 * @memberof miqStaticAssets
 * @ngdoc component
 * @name dialogEditorTabs
 * @description
 *    Component implementing behaviour for the tabs inside of
 *    the dialogs.
 * @example
 * <dialog-editor-tabs>
 * </dialog-editor-tabs>
 */
export default class TabList {
  public template = require('./tab-list.html');
  public controller: any = TabListController;
  public controllerAs: string = 'vm';
  public bindings = {
    setupModalOptions: '&'
  };
}
