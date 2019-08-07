/* global add_flash camelizeQuadicon */
(function() {
  var CONTROLLER_NAME = 'reportDataController';
  var EXPAND_TREES = ['savedreports_treebox', 'widgets_treebox'];
  var TREES_WITHOUT_PARENT = ['pxe', 'ops'];
  var TREE_TABS_WITHOUT_PARENT = ['action_tree', 'alert_tree', 'schedules_tree'];
  var USE_TREE_ID = ['automation_manager'];
  var DEFAULT_VIEW = 'grid';
  var TOOLBAR_CLICK_FINISH = 'TOOLBAR_CLICK_FINISH';

  function isAllowedParent(initObject) {
    return TREES_WITHOUT_PARENT.indexOf(ManageIQ.controller) === -1 &&
      TREE_TABS_WITHOUT_PARENT.indexOf(initObject.activeTree) === -1;
  }

  function tileViewSelector() {
    return document.querySelector('miq-tile-view');
  }

  function tableViewSelector() {
    return document.querySelector('miq-data-table');
  }

  function constructSuffixForTreeUrl(initObject, item) {
    var itemId = _.isString(initObject.showUrl) && initObject.showUrl.indexOf('xx-') !== -1 ? '_-' + item.id : '-' + item.id;
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
        {id: 'per_page_200', text: 200, value: 200, hidden: false, enabled: true},
        {id: 'per_page_500', text: 500, value: 500, hidden: false, enabled: true},
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
    this.subscription = listenToRx(function(event) {
      if (event.initController && event.initController.name === CONTROLLER_NAME) {
        this.initController(event.initController.data);
      } else if (event.unsubscribe && event.unsubscribe === CONTROLLER_NAME) {
        this.onUnsubscribe();
      } else if (event.toolbarEvent && (event.toolbarEvent === 'itemClicked')) {
        this.setExtraClasses();
      } else if (event.type === TOOLBAR_CLICK_FINISH && (tileViewSelector() || tableViewSelector())) {
        this.setExtraClasses(this.initObject.gtlType);
      } else if (event.refreshData && event.refreshData.name === CONTROLLER_NAME) {
        this.refreshData(event.data);
      } else if (event.setScope && event.setScope.name === CONTROLLER_NAME) {
        this.setScope(event.data);
      } else if (event.type === 'gtlSetOneRowActive') {
        this.gtlSetOneRowActive(event.item);
      }

      if (event.controller === CONTROLLER_NAME && this.apiFunctions && this.apiFunctions[event.action]) {
        var actionCallback = this.apiFunctions[event.action];
        var resultData = actionCallback.apply(this, event.data);
        if (event.eventCallback) {
          event.eventCallback(resultData);
        }
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

  ReportDataController.prototype.refreshData = function(data) {
    this.initController(_.merge(this.initObject, data));
  };

  ReportDataController.prototype.setScope = function(scope) {
    this.initObject.additionalOptions.named_scope = [];
    this.refreshData({additionalOptions: {named_scope: scope}});
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
    this.subscription.unsubscribe();
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

  ReportDataController.prototype.gtlSetOneRowActive = function(item, _event) {
    this.gtlData.rows.forEach(function(row) {
      row.selected = false;
    });

    var selectedItem = _.find(this.gtlData.rows, {long_id: item.long_id});
    selectedItem.selected = true;

    this.$window.sendDataWithRx({rowSelect: selectedItem});

    ManageIQ.gridChecks = [];
    ManageIQ.gridChecks.push(item.long_id);
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

    // nothing to do
    if (!this.initObject.showUrl) {
      return false;
    }

    // clicks just outside the checkbox
    if ($(event.target).is('.is-checkbox-cell')) {
      return false;
    }

    if (this.initObject.additionalOptions && this.initObject.additionalOptions.custom_action) {
      sendDataWithRx({
        type: 'GTL_CLICKED',
        actionType: this.initObject.additionalOptions.custom_action.type,
        payload: {
          item: item,
          action: this.initObject.additionalOptions.custom_action,
        },
      });
      return;
    }

    var prefix = this.initObject.showUrl;
    var splitUrl = this.initObject.showUrl.split('/');
    if (item.parent_path && item.parent_id) {
      miqSparkleOn();
      this.$window.DoNav(item.parent_path + '/' + item.parent_id);
    } else if (this.initObject.isExplorer && isCurrentControllerOrPolicies(splitUrl)) {
      miqSparkleOn();
      var itemId = item.id;
      if (_.isString(this.initObject.showUrl) && this.initObject.showUrl.indexOf('?id=') !== -1) {
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
    } else if (prefix !== 'true') {
      miqSparkleOn();
      var lastChar = prefix[prefix.length - 1];
      prefix = (lastChar !== '/' && lastChar !== '=') ? prefix + '/' : prefix;
      this.$window.DoNav(prefix + (item.long_id || item.id));
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
      var selectedItem = _.find(this.gtlData.rows, {long_id: item.long_id});
      if (selectedItem) {
        selectedItem.checked = isSelected;
        selectedItem.selected = isSelected;
        this.$window.sendDataWithRx({rowSelect: selectedItem});
        if (isSelected) {
          ManageIQ.gridChecks.push(item.long_id);
        } else {
          var index = ManageIQ.gridChecks.indexOf(item.long_id);
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
    this.gtlType = initObject.gtlType || DEFAULT_VIEW;
    this.setLoading(true);
    ManageIQ.gridChecks = [];
    this.$window.sendDataWithRx({setCount: 0});
  };

  ReportDataController.prototype.setLoading = function(state) {
    this.$window.ManageIQ.gtl.loading = state;
    this.settings.isLoading = state;
    state ? miqSparkleOn() : miqSparkleOff();
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
  *     parentId: string,
  *     isExplorer: Boolean
  *   }
  * ```
  * @returns {Object} promise of fetched data.
  */
  ReportDataController.prototype.initController = function(initObject) {
    this.setLoading(true);
    initObject.modelName = decodeURIComponent(initObject.modelName);
    this.initObjects(initObject);
    this.setExtraClasses(initObject.gtlType);
    return this.getData(initObject.modelName,
      initObject.activeTree,
      initObject.parentId,
      initObject.isExplorer,
      this.settings,
      initObject.records,
      initObject.additionalOptions)
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

        // pagination doesn't update on no records (components/data-table/data-table.html:4:99), hide it instead
        if (!this.gtlData.rows.length) {
          this.setExtraClasses();
        }

        this.$timeout(function() {
          this.setLoading(false);
          this.$window.ManageIQ.gtl.isFirst = this.settings.current === 1;
          this.$window.ManageIQ.gtl.isLast = this.settings.current === this.settings.total;
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
  * @returns {undefined}
  */
  ReportDataController.prototype.setDefaults = function() {
    this.settings.selectAllTitle = __('Select All');
    this.settings.sortedByTitle = __('Sorted By');
    this.settings.dropdownClass = ['dropup'];
    this.settings.translateTotalOf = function(start, end, total) {
      if (typeof start !== 'undefined' && typeof end !== 'undefined' && typeof total !== 'undefined') {
        return sprintf(__('%d - %d of %d'), start + 1, end + 1, total);
      }
      return start + ' - ' + end + ' of ' + total;
    };
    this.settings.translateTotalof = this.settings.translateTotalOf;
  };

  ReportDataController.prototype.setExtraClasses = function(viewType) {
    var mainContent = this.$document.querySelector('#main-content');
    var pagination = this.$document.querySelector('#paging_div .miq-pagination');

    if (!mainContent) {
      return;
    }

    angular.element(mainContent).removeClass('miq-list-content');
    angular.element(pagination).css('display', 'none');

    if (viewType === 'grid' || viewType === 'tile') {
      angular.element(pagination).css('display', 'block');
    } else if (viewType === 'list') {
      angular.element(mainContent).addClass('miq-list-content');
      angular.element(pagination).css('display', 'block');
    }
  };

  window.miqGtlSetExtraClasses = function() {
    // need this to work even if there is no GTL instance running
    return ReportDataController.prototype.setExtraClasses.call({
      $document: document,
    });
  };

  ReportDataController.prototype.activateNodeSilently = function(itemId) {
    var treeId = angular.element('.collapse.in .treeview').attr('id');
    if (EXPAND_TREES.indexOf(treeId) !== -1) {
      miqTreeExpandRecursive(treeId, itemId);
    }
  };

  ReportDataController.prototype.movePagination = function() {
    this.$timeout(function() {
      var sortItems = this.$document.getElementsByTagName('miq-sort-items');
      if (sortItems) {
        angular.element(sortItems).addClass(this.settings.dropdownClass[0]);
      }
      $('table td.narrow').addClass('table-view-pf-select').removeClass('narrow');
      var pagination = this.$document.getElementsByClassName('miq-pagination');
      var pagingDiv = this.$document.querySelector('#paging_div');
      // If more than one angular pagination is present remove some left overs.
      if (pagination.length !== 1) {
        $(pagination).each(function(index, item) {
          // keep the first one
          index !== 0 && item.remove();
        });
      }
      if (pagination && pagination.length > 0 && pagingDiv && $(pagingDiv).find(pagination).length !== 1) {
        var oldPagination = pagingDiv.querySelector('div');
        oldPagination ? oldPagination.remove() : null;

        var cols = 12;
        if ($('#form_buttons_div').css('display') !== 'none') {
          if ($('#form_buttons_div').children().length !== 0) {
            cols = 10;
          } else {
            $('#form_buttons_div').css('display', 'none');
          }
        }

        var col = $('<div class="col-md-' + cols + '"></div>');
        $(pagingDiv).append(col);
        col[0].appendChild(pagination[0]);
      }

      if (this.initObject.pages) {
        $(pagingDiv).show();
      }

      // calculates the height of main content from toolbar and footer, needed
      // to make sure the paginator is not off the screen
      miqInitMainContent();
    }.bind(this));
  };

  /**
  * Method for fetching data from server. gtlData, settings and pePage is selected after fetching data.
  * @param {String} modelName name of current model.
  * @param {Number} activeTree ID of active tree node.
  * @param {Number} parentId parent Id, if some nested items are displayed.
  * @param {Boolean} isExplorer true | false if we are in explorer part of application.
  * @param {Object} settings settings object.
  * @param {Array} records array of reccords.
  * @param {Object} additionalOptions specific options for current view.
  * @returns {Object} promise of retriveRowsAndColumnsFromUrl of MiQDataTableService.
  */
  ReportDataController.prototype.getData = function(modelName,
    activeTree,
    parentId,
    isExplorer,
    settings,
    records,
    additionalOptions) {
    var basicSettings = {
      current: 1,
      perpage: 20,
      sort_col: 0,
      sort_dir: 'DESC',
    };
    return this.MiQDataTableService
      .retrieveRowsAndColumnsFromUrl(modelName, activeTree, parentId, isExplorer, settings, records, additionalOptions)
      .then(function(gtlData) {
        this.settings = gtlData.settings || basicSettings;
        if (this.settings.sort_col === -1) {
          this.settings.sort_col = 0;
        }

        // Camelize the quadicon data received from the server
        _.each(gtlData.rows, function(row) {
          row.quad = camelizeQuadicon(row.quad);
        });

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
        // Apply gettext __() on column headers
        for (var i = 0;  i < gtlData.cols.length; i++) {
          var column = gtlData.cols[i];
          if (column.hasOwnProperty('text')) {
            column.header_text = __(column.text);
          }
        }
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
    .controller(CONTROLLER_NAME, ReportDataController);
})();
