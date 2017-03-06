(function() {
  var COTNROLLER_NAME = 'reportDataController';
  var MAIN_CONTETN_ID = 'main-content';

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
    this.settings = {};
    this.MiQDataTableService = MiQDataTableService;
    this.MiQEndpointsService = MiQEndpointsService;
    this.$filter = $filter;
    this.$scope = $scope;
    this.$location = $location;
    this.$document = $document[0];
    this.$timeout = $timeout;
    this.$window = $window;
    initEndpoints(this.MiQEndpointsService);
    subscribeToSubject.bind(this)();
    this.perPage = defaultPaging();
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
    var prefix = this.initObject.showUrl;
    var splitUrl = this.initObject.showUrl.split('/');
    if (this.initObject.isExplorer && isCurrentControllerOrPolicies(splitUrl)) {
      var itemId = item.id;
      if (this.initObject.showUrl.indexOf('?id=') !== -1 ){
        var itemId = this.initObject.showUrl.indexOf('xx-') !== -1 ? '_-' + item.id : '-' + item.id;
      }
      var url = prefix + itemId;
      $.post(url).always(function() {
        this.setExtraClasses();
      }.bind(this));
    } else {
      prefix = prefix[prefix.length -1 ] !== '/' ? prefix + '/' : prefix;
      this.$window.DoNav(prefix + item.id);
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
      if (start !== undefined && end !== undefined && total !== undefined ) {
        return sprintf(__('%d - %d of %d'), start + 1, end + 1, total);
      }
      return start + ' - ' + end + ' of ' + total;
    };
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

  ReportDataController.prototype.movePagination = function() {
    this.$timeout(function() {
      var pagination = this.$document.getElementsByClassName('miq-pagination');
      var pagind_div = this.$document.querySelector('#paging_div .col-md-12');
      if (pagination && pagination.length > 0 && pagind_div) {
        pagind_div.appendChild(pagination[0]);
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
      sort_dir: "DESC",
    };
    return this.MiQDataTableService.retrieveRowsAndColumnsFromUrl(modelName, activeTree, currId, isExplorer, settings, records)
      .then(function(gtlData) {
        this.settings = gtlData.settings || basicSettings;
        this.gtlData = gtlData;
        this.perPage.text = this.settings.perpage;
        this.perPage.value = this.settings.perpage;
        this.initObject.showUrl = this.settings.url || this.initObject.showUrl;
        var splitUrl = this.initObject.showUrl.split('/');
        if (splitUrl && splitUrl[1] === 'vm') {
          splitUrl[1] = 'vm_infra';
          this.initObject.showUrl = splitUrl.join('/');
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
    .controller(COTNROLLER_NAME, ReportDataController);
})();
