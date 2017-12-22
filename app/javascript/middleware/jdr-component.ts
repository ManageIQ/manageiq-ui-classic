import * as ng from 'angular';
import * as _ from 'lodash';

export default class JdrReport implements ng.IComponentOptions {
  public controller: any = JdrReportController;
  public templateUrl: string = '/static/middleware/jdr.html.haml';
  public controllerAs: string = 'mwjdr';
  public bindings: any = {
    serverId: '@',
    downloadUrl: '@',
    deleteUrl: '@'
  };
}

class JdrReportController {
  public static $inject = ['MiQDataTableService', 'MiQEndpointsService', '$window', '$http'];
  public serverId: string;
  public settings: any = {};
  public rows: any;
  public cols: any;
  public perPage: any;
  public downloadUrl: string;
  public deleteUrl: string;

  public constructor(private MiQDataTableService, private MiQEndpointsService, private $window, private $http) {}

  public $onInit() {
    this.initPerPageObject();
    this.MiQEndpointsService.rootPoint = '/' + ManageIQ.controller;
    this.MiQEndpointsService.endpoints.listDataTable = '/' + ManageIQ.constants.reportData;
    this.bindToRx();
    this.fetchData();
  }

  private fetchData() {
    this.settings.isLoading = true;
    this.rows = [];
    return this.MiQDataTableService
      .retrieveRowsAndColumnsFromUrl('ManageIQ::Providers::Hawkular::MiddlewareManager::MiddlewareDiagnosticReport',
                                     null,
                                     this.serverId,
                                     false,
                                     this.settings)
      .then(payload => this.onFetchData(payload));
  }

  private onFetchData(payload) {
    this.rows = payload.rows;
    this.cols = [
      ...payload.cols,
      {
        'text': __('Actions'),
        'sort': 'str',
        'align': 'left'
      }
    ];
    this.rows.forEach(oneRow => {
      oneRow.cells = this.addDownloadButton(oneRow);
    });
    this.perPage.text = payload.settings.perpage;
    this.perPage.value = payload.settings.perpage;
    this.settings = payload.settings;
    this.settings.dropdownClass = 'dropup';
    this.settings.selectAllTitle = 'select all';
    this.settings.columns = this.cols;
    this.updateSort();
    this.settings.translateTotalOf = (start, end, total) => {
      if (typeof start !== 'undefined' && typeof end !== 'undefined' && typeof total !== 'undefined') {
        return __(`${start} - ${end} of ${total}`);
      }
      return start + ' - ' + end + ' of ' + total;
    };
    this.settings.isLoading = false;
  }

  public onSort(headerId, isAscending) {
    this.settings.sortBy.sortObject = this.cols[headerId];
    this.settings.sortBy.isAscending = isAscending;
    this.fetchData();
  }

  public onLoadNext(start, perPage) {
    this.perPage.value = perPage;
    this.perPage.text = perPage + ' ' + this.perPage.labelItems;
    this.settings.perpage = perPage;
    this.settings.startIndex = start;
    this.settings.current = ( start / perPage) + 1;
    this.fetchData();
  }

  public onItemSelect(item, isSelected) {
    let selectedItem: any = _.find(this.rows, {id: item.id});
    selectedItem.checked = isSelected;
    selectedItem.selected = isSelected;
    this.$window.sendDataWithRx({type: 'jdr_selected', payload: {
      item: selectedItem,
      countSelected: _.filter(this.rows, {selected: true}).length,
      isSelected: isSelected
    }});
  }

  public onDonwloadClick(rowId) {
    DoNav(`${this.downloadUrl}?id=${this.serverId}&key=${rowId}`);
  }

  public onDeleteClick() {
    const selectedItems = _.chain(this.rows)
                           .filter({selected: true})
                           .map((row: any) => row && row.id)
                           .value();
    this.$http
      .post(this.deleteUrl, {id: this.serverId, mw_dr_selected: selectedItems})
      .then((status) => {
        const msg = status.data.msg[0];
        add_flash(msg.message, msg.level);
        this.$window.sendDataWithRx({type: 'jdr_selected', payload: {countSelected: 0}});
        this.fetchData().then(() => this.selectItems(status.data.selected_drs));
      });
  }

  private selectItems(itemsToSelect) {
    if (itemsToSelect) {
      this.rows.forEach(item => {
        if (itemsToSelect.indexOf(item.long_id) !== -1) {
          item.selected = true;
          item.checked= true;
          this.$window.sendDataWithRx({type: 'jdr_selected', payload: {
            item: item,
            countSelected: _.filter(this.rows, {selected: true}).length,
            isSelected: true
          }});
        }
      });
    }
    
  }

  private bindToRx() {
    this.$window.ManageIQ.angular.rxSubject.subscribe((action) => {
      if (action.type === 'delete_jdr') {
        this.onDeleteClick();
      }
      if (action.type === 'refresh_jdr') {
        this.fetchData();
      }
    });
  }

  private updateSort() {
    var sortId = _.findIndex(this.cols, {col_idx: parseInt(this.settings.sort_col, 10)});
    if (sortId !== -1) {
      this.settings.sortBy = {
        sortObject: this.cols[sortId],
        isAscending: this.settings.sort_dir === 'ASC',
      };
    }
  }

  private initPerPageObject() {
    this.perPage = {
      enabled: true,
      hidden: false,
      text: __('20'),
      value: 20,
      items: [
        {'text': __('5'),'value':5,'hidden':false,'enabled':true},
        {'text': __('10'),'value':10,'hidden':false,'enabled':true},
        {'text': __('20'),'value':20,'hidden':false,'enabled':true},
        {'text': __('50'),'value':50,'hidden':false,'enabled':true},
        {'text': __('100'),'value':100,'hidden':false,'enabled':true},
        {'text': __('1000'),'value':1000,'hidden':false,'enabled':true},
        {'text': __('All'),'value':-1,'hidden':false,'enabled':true}
      ]
    };
  }

  private addDownloadButton(row) {
    row.cells.forEach(oneCell => oneCell.text === '' && (oneCell.text = 'N/A'));
    return [...row.cells, {
      is_button: true,
      title: __('Download'),
      text: __('Download'),
      onclick: `this.onDonwloadClick("${row.id}")`,
      disabled: row.cells[2].text.indexOf('N/A') !== -1,
      bindTo: this
    }];
  }
}
