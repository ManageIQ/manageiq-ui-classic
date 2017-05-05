(function() {
  var COTNROLLER_NAME = 'reportDataController';
  var MAIN_CONTETN_ID = 'main-content';
  var EXPAND_TREES = ['savedreports_treebox', 'widgets_treebox'];
  var TREES_WITHOUT_PARENT = ['pxe', 'ops'];
  var TREE_TABS_WITHOUT_PARENT = ['action_tree', 'alert_tree', 'schedules_tree'];
  var USE_TREE_ID = ['automation_manager'];

  function isAllowedParent(initObject) {
    return TREES_WITHOUT_PARENT.indexOf(ManageIQ.controller) === -1 &&
      TREE_TABS_WITHOUT_PARENT.indexOf(initObject.activeTree) === -1;
  }

  function constructSuffixForTreeUrl(initObject, item) {
    var itemId = initObject.showUrl.indexOf('xx-') !== -1 ? '_-' + item.id : '-' + item.id;
    if (item.parent_id && item.parent_id[item.parent_id.length - 1] !== '-') {
      itemId = item.parent_id + '_' + item.tree_id;
    } else if (isAllowedParent(initObject)) {
      itemId = (USE_TREE_ID.indexOf(ManageIQ.controller) === -1) ? '_' : '';
      itemId = itemId + item.tree_id;
    }
    return itemId;
  }
  /**
  * Private method for setting rootPoint of MiQEndpointsService.
  * @param {Object} MiQEndpointsService service responsible for endpoits.
  * @returns {undefined}
  */
  function initEndpoints(MiQEndpointsService) {
    MiQEndpointsService.rootPoint = '/' + ManageIQ.controller;
    MiQEndpointsService.endpoints.listDataTable = '/' + ManageIQ.constants.reportData;
  }

  function isCurrentControllerOrPolicies(splitUrl) {
    return splitUrl && (splitUrl[1] === ManageIQ.controller || splitUrl[2] === 'policies');
  }

  function isCurrentOpsWorkerSelected(items, initObject) {
    if (initObject.activeTree === 'diagnostics_tree' && ManageIQ.controller === 'ops') {
      var lastSlash = initObject.showUrl.indexOf('/', 5) + 1;
      var itemId = initObject.showUrl.substring(lastSlash);
      initObject.showUrl = initObject.showUrl.substring(0, lastSlash);
      if (itemId) {
        itemId = itemId[itemId.length - 1] === '/' ? itemId.substring(0, itemId.length - 1) : itemId;
        return _.find(items, {id: itemId});
      }
    }

    return;
  }

  /**
  * Method for init paging component for GTL.
  * Default paging has 5, 10, 20, 50, 100, 1000
  * @returns {Object} pagination object.
  */
  function defaultPaging() {
    return {
      labelItems: __('Items'),
      enabled: true,
      text: 10,
      value: 10,
      hidden: false,
      items: [
        {id: 'per_page_5', text: 5, value: 5, hidden: false, enabled: true},
        {id: 'per_page_10', text: 10, value: 10, hidden: false, enabled: true},
        {id: 'per_page_20', text: 20, value: 20, hidden: false, enabled: true},
        {id: 'per_page_50', text: 50, value: 50, hidden: false, enabled: true},
        {id: 'per_page_100', text: 100, value: 100, hidden: false, enabled: true},
        {id: 'per_page_1000', text: 1000, value: 1000, hidden: false, enabled: true},
      ],
    };
  }

  /**
  * Private method for subscribing to rxSubject.
  * For success functuon @see ToolbarController#onRowSelect()
  * @returns {undefined}
  */
  function subscribeToSubject() {
    this.subscription = ManageIQ.angular.rxSubject.subscribe(function(event) {
      if (event.initController && event.initController.name === COTNROLLER_NAME) {
        this.initController(event.initController.data);
      } else if (event.unsubscribe && event.unsubscribe === COTNROLLER_NAME) {
        this.onUnsubscribe();
      } else if (event.tollbarEvent && (event.tollbarEvent === 'itemClicked')) {
        this.setExtraClasses();
      }

      if (event.controller === COTNROLLER_NAME && this.apiFunctions && this.apiFunctions[event.action]) {
        var actionCallback = this.apiFunctions[event.action];
        actionCallback.apply(this, event.data);
      }
    }.bind(this),
    function(err) {
      console.error('Angular RxJs Error: ', err);
    },
    function() {
      console.debug('Angular RxJs subject completed, no more events to catch.');
    });
  }

  /**
  * Constructor for GTL controller. This constructor will init params accessible via `this` property and calls
  * initEndpoints, subscribes to subject, and sets default paging.
  * @param {Object} MiQDataTableService datatable service for fetching GTL data and filtering them.
  * @param {Object} MiQEndpointsService service for setting basic routes.
  * @param {Object} $filter angular filter Service.
  * @param {Object} $location angular location object.
  * @param {Object} $scope current scope.
  * @param {Object} $document angular's document service.
  * @param {Object} $timeout angular's timeout service.
  * @param {Object} $window angular's window service.
  * @returns {undefined}
  */
  var ReportDataController = function(MiQDataTableService,
                                      MiQEndpointsService,
                                      $filter,
                                      $location,
                                      $scope,
                                      $document,
                                      $timeout,
                                      $window) {
    var vm = this;
    vm.settings = {};
    vm.MiQDataTableService = MiQDataTableService;
    vm.MiQEndpointsService = MiQEndpointsService;
    vm.$filter = $filter;
    vm.$scope = $scope;
    vm.$location = $location;
    vm.$document = $document[0];
    vm.$timeout = $timeout;
    vm.$window = $window;
    initEndpoints(vm.MiQEndpointsService);
    if (ManageIQ.qe && ManageIQ.qe.gtl && ManageIQ.qe.gtl.actionsToFunction) {
      vm.apiFunctions = ManageIQ.qe.gtl.actionsToFunction.bind(vm)();
    }
    subscribeToSubject.bind(vm)();
    vm.perPage = defaultPaging();
  };

  ReportDataController.prototype.setSort = function(headerId, isAscending) {
    if (this.gtlData.cols[headerId]) {
      this.settings.sortBy = {
        sortObject: this.gtlData.cols[headerId],
        isAscending: isAscending,
      };
    }
  };

  ReportDataController.prototype.onUnsubscribe = function() {
    this.subscription.dispose();
  };

  /**
  * Method for handeling sort function. This will be called when sort of items will be needed. This method will set
  * sort object to settings and calls method for filtering and sorting.
  * @param {Number} headerId ID of column which is sorted by.
  * @param {Boolean} isAscending true | false.
  * @returns {undefined}
  */
  ReportDataController.prototype.onSort = function(headerId, isAscending) {
    this.setSort(headerId, isAscending);
    this.initController(this.initObject);
  };

  ReportDataController.prototype.setPaging = function(start, perPage) {
    this.perPage.value = perPage;
    this.perPage.text = perPage + ' ' + this.perPage.labelItems;
    this.settings.perpage = perPage;
    this.settings.startIndex = start;
    this.settings.current = ( start / perPage) + 1;
  };

  /**
  * Method for loading more items, either by selecting next page, or by choosing different number of items per page.
  * It will calculate start index of page and will call method for filtering and sorting items.
  * @param {Number} start index of item, which will be taken as start item.
  * @param {Number} perPage Number of items per page.
  * @returns {undefined}
  */
  ReportDataController.prototype.onLoadNext = function(start, perPage) {
    this.setPaging(start, perPage);
    this.initController(this.initObject);
  };

  /**
  * Method for handeling clicking on item (either gliphicon or item). It will perform navigation or post message based
  * on type of items.
  * @param {Object} item which item was clicked.
  * @param {Object} event jQuery event.
  * @returns {undefined}
  */
  ReportDataController.prototype.onItemClicked = function(item, event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.initObject.showUrl) {
      var prefix = this.initObject.showUrl;
      var splitUrl = this.initObject.showUrl.split('/');
      if (this.initObject.isExplorer && isCurrentControllerOrPolicies(splitUrl)) {
        var itemId = item.id;
        if (this.initObject.showUrl.indexOf('?id=') !== -1 ) {
          itemId = constructSuffixForTreeUrl(this.initObject, item);
          this.activateNodeSilently(itemId);
        }
        if (itemId.indexOf('unassigned') !== -1) {
          prefix = '/' + ManageIQ.controller + '/tree_select/?id=';
        }
        var url = prefix + itemId;
        $.post(url).always(function() {
          this.setExtraClasses();
        }.bind(this));
      } else {
        var lastChar = prefix[prefix.length - 1];
        prefix = (lastChar !== '/' && lastChar !== '=') ? prefix + '/' : prefix;
        this.$window.DoNav(prefix + (item.long_id || item.id));
      }
    }
    return false;
  };

  /**
  * Method which will be fired when item was selected (either trough select box or by clicking on tile).
  * @param {Object} item which item was selected.
  * @param {Boolean} isSelected true | false.
  * @returns {undefined}
  */
  ReportDataController.prototype.onItemSelect = function(item, isSelected) {
    if (typeof item !== 'undefined') {
      var selectedItem = _.find(this.gtlData.rows, {id: item.id});
      if (selectedItem) {
        selectedItem.checked = isSelected;
        selectedItem.selected = isSelected;
        this.$window.sendDataWithRx({rowSelect: selectedItem});
        if (isSelected) {
          ManageIQ.gridChecks.push(item.id);
        } else {
          var index = ManageIQ.gridChecks.indexOf(item.id);
          index !== -1 && ManageIQ.gridChecks.splice(index, 1);
        }
      }
    }
  };

  ReportDataController.prototype.initObjects = function(initObject) {
    this.gtlData = { cols: [], rows: [] };
    this.initObject = initObject;
    if (this.initObject.showUrl === '') {
      this.initObject.showUrl = '/' + ManageIQ.controller;
      if (this.initObject.isExplorer) {
        this.initObject.showUrl += '/x_show/';
      } else {
        this.initObject.showUrl += '/show/';
      }
    } else if (this.initObject.showUrl === 'false') {
      this.initObject.showUrl = false;
    }
    this.gtlType = initObject.gtlType || 'grid';
    this.settings.isLoading = true;
    ManageIQ.gridChecks = [];
    this.$window.sendDataWithRx({setCount: 0});
  };

  /**
  * Method for initializing controller. Good for bootstraping controller after loading items. This method will call
  * getData for fetching data for current state. After these data were fetched, sorting items and filtering them takes
  * place.
  * @param {Object} initObject this object will hold all information about current state.
  * ```
  *   initObject: {
  *     modelName: string,
  *     gtlType: string,
  *     activeTree: string,
  *     currId: string,
  *     isExplorer: Boolean
  *   }
  * ```
  * @returns {Object} promise of fetched data.
  */
  ReportDataController.prototype.initController = function(initObject) {
    this.$window.ManageIQ.gtl = this.$window.ManageIQ.gtl || {};
    this.$window.ManageIQ.gtl.loading = true;
    initObject.modelName = decodeURIComponent(initObject.modelName);
    this.initObjects(initObject);
    this.setExtraClasses(initObject.gtlType);
    this.showMessage = this.$location.search().flash_msg;
    return this.getData(initObject.modelName,
                        initObject.activeTree,
                        initObject.currId,
                        initObject.isExplorer,
                        this.settings,
                        initObject.records)
      .then(function(data) {
        this.settings.hideSelect = initObject.hideSelect;
        var start = (this.settings.current - 1) * this.settings.perpage;
        this.setPaging(start, this.settings.perpage);
        var sortId = _.findIndex(this.gtlData.cols, {col_idx: parseInt(this.settings.sort_col, 10)});
        if (sortId !== -1) {
          this.setSort(sortId, this.settings.sort_dir === 'ASC');
        }
        this.setDefaults();
        this.movePagination();
        this.$timeout(function() {
          this.$window.ManageIQ.gtl.loading = false;
          this.$window.ManageIQ.gtl.isFirst = this.settings.current === 1;
          this.$window.ManageIQ.gtl.isLast = this.settings.current === this.settings.totla;
        }.bind(this));
        return data;
      }.bind(this));
  };

  /**
  * Public method for setting default values of settings object.
  * Fileds which are set:
  *       selectAllTitle - String  => title for select all
  *       sortedByTitle  - String  => title for sort by
  *       isLoading      - Boolean => if loading has finished.
  *       scrollElement  - String  => ID of scroll element.
  * @returns {undefined}
  */
  ReportDataController.prototype.setDefaults = function() {
    this.settings.selectAllTitle = __('Select All');
    this.settings.sortedByTitle = __('Sorted By');
    this.settings.isLoading = false;
    this.settings.scrollElement = MAIN_CONTETN_ID;
    this.settings.dropDownClass = ['dropup'];
    this.settings.translateTotalOf = function(start, end, total) {
      if (typeof start !== 'undefined' && typeof end !== 'undefined' && typeof total !== 'undefined') {
        return sprintf(__('%d - %d of %d'), start + 1, end + 1, total);
      }
      return start + ' - ' + end + ' of ' + total;
    };
    this.settings.translateTotalof = this.settings.translateTotalOf;
  };

  ReportDataController.prototype.setExtraClasses = function(viewType) {
    var mainContent = this.$document.getElementById(MAIN_CONTETN_ID);
    if (mainContent) {
      angular.element(mainContent).removeClass('miq-sand-paper');
      angular.element(mainContent).removeClass('miq-list-content');
      if (viewType && (viewType === 'grid' || viewType === 'tile')) {
        angular.element(mainContent).addClass('miq-sand-paper');
      } else if (viewType && viewType === 'list') {
        angular.element(mainContent).addClass('miq-list-content');
      }
    }

    var pagination = this.$document.getElementsByClassName('miq-pagination');
    if (pagination && pagination.length > 0 && ! viewType) {
      pagination[0].parentNode.removeChild(pagination[0]);
    }
  };

  ReportDataController.prototype.activateNodeSilently = function(itemId) {
    var treeId = angular.element('.collapse.in .treeview').attr('id');
    if (EXPAND_TREES.indexOf(treeId) !== -1) {
      miqTreeExpandRecursive(treeId, itemId);
    }
  };

  ReportDataController.prototype.movePagination = function() {
    this.$timeout(function() {
      $('table td.narrow').addClass('table-view-pf-select').removeClass('narrow');
      var pagination = this.$document.getElementsByClassName('miq-pagination');
      var pagingDiv = this.$document.querySelector('#paging_div .col-md-12');
      if (pagination && pagination.length > 0 && pagingDiv) {
        pagingDiv.appendChild(pagination[0]);
      }
    }.bind(this));
  };

  /**
  * Method for fetching data from server. gtlData, settings and pePage is selected after fetching data.
  * @param {String} modelName name of current model.
  * @param {Number} activeTree ID of active tree node.
  * @param {Number} currId current Id, if some nested items are displayed.
  * @param {Boolean} isExplorer true | false if we are in explorer part of application.
  * @param {Object} settings settings object.
  * @param {Array} records array of reccords.
  * @returns {Object} promise of retriveRowsAndColumnsFromUrl of MiQDataTableService.
  */
  ReportDataController.prototype.getData = function(modelName, activeTree, currId, isExplorer, settings, records) {
    var basicSettings = {
      current: 1,
      perpage: 20,
      sort_col: 0,
      sort_dir: 'DESC',
    };
    return this.MiQDataTableService.retrieveRowsAndColumnsFromUrl(modelName, activeTree, currId, isExplorer, settings, records)
      .then(function(gtlData) {
        this.settings = gtlData.settings || basicSettings;
        if (this.settings.sort_col === -1) {
          this.settings.sort_col = 0;
        }
        this.gtlData = gtlData;
        this.perPage.text = this.settings.perpage;
        this.perPage.value = this.settings.perpage;
        this.initObject = this.initObject || {};
        this.initObject.showUrl = this.settings.url || this.initObject.showUrl;
        if (this.initObject.showUrl) {
          var splitUrl = this.initObject.showUrl.split('/');
          if (splitUrl && splitUrl[1] === 'vm') {
            splitUrl[1] = splitUrl[2] === 'policies' ? 'vm_infra' : 'vm_cloud';
            this.initObject.showUrl = splitUrl.join('/');
          }
        }
        this.onItemSelect(isCurrentOpsWorkerSelected(this.gtlData.rows, this.initObject), true);
        return gtlData;
      }.bind(this));
  };

  ReportDataController.$inject = [
    'MiQDataTableService',
    'MiQEndpointsService',
    '$filter',
    '$location',
    '$scope',
    '$document',
    '$timeout',
    '$window',
  ];
  window.miqHttpInject(angular.module('ManageIQ.report_data'))
    .controller(COTNROLLER_NAME, ReportDataController);
})();
