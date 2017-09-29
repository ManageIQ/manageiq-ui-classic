import * as ng from 'angular';

export default class JdrReport implements ng.IComponentOptions {
  public controller: any = JdrReportController;
  public templateUrl: string = '/static/middleware/jdr.html.haml';
  public controllerAs: string = 'mwjdr';
  public bindings: any = {
    serverId: '@'
  };
}

class JdrReportController {
  public static $inject = ['MiQDataTableService', 'MiQEndpointsService',];
  public serverId: string;
  public settings: any;
  public rows: any;
  public cols: any;
  public perPage: any;

  public constructor(private MiQDataTableService, private MiQEndpointsService) {
    MiQEndpointsService.rootPoint = '/' + ManageIQ.controller;
    MiQEndpointsService.endpoints.listDataTable = '/' + ManageIQ.constants.reportData;
  }

  public $onInit() {
    let basicSettings = {
      current: 1,
      perpage: 20,
      sort_col: 0,
      sort_dir: 'DESC',
    };
    this.MiQDataTableService
      .retrieveRowsAndColumnsFromUrl('middleware_diagnostic_report', null, this.serverId)
      .then(payload => {
        console.log(payload);
      });
    this.getData();
  }

  private getData() {
    this.settings = {
      dropdownClass: "dropup",
      current: 1,
      perpage: 20,
      sort_col: 1,
      selectAllTitle: "select all",
      sortBy: {
        isAscending: true,
        sortObject: {
          text: "Filename",
          col_idx: 0
        }
      },
      total: 1,
      culumns: this.cols,
      items: 1
    };
    this.rows = [{
      "id": "16",
      "cells": [
        {
          "is_checkbox": true
        },
        {
          "title": "Error",
          "icon": "pficon pficon-error-circle-o"
        },
        {
          "text": "N/A"
        },
        {
          "text": "N/A"
        },
        {
          "text": "	Fri, 29 Sep 2017 12:42:19 +0000"
        },
        {
          "text": "admin"
        },
        {
          "text": "Error"
        },
        {
          is_button: true,
          title: 'Download',
          text: 'Download',
          onclick: `this.onDonwloadClick(16)`,
          bindTo: this
        }
      ]
    }];
    this.cols = [
      {
        "is_narrow": true
      },
      {
        "is_narrow": true
      },
      {
        "text": "Filename",
        "sort": "str",
        "col_idx": 0,
        "align": "left"
      },
      {
        "text": "Size",
        "sort": "str",
        "col_idx": 1,
        "align": "left"
      },
      {
        "text": "Queued at",
        "sort": "str",
        "col_idx": 2,
        "align": "left"
      },
      {
        "text": "Username",
        "sort": "str",
        "col_idx": 3,
        "align": "left"
      },
      {
        "text": "Status",
        "sort": "str",
        "col_idx": 5,
        "align": "left"
      },
      {
        "text": "Actions",
        "sort": "str",
        "col_idx": 5,
        "align": "left"
      }
    ];
    this.perPage = {
      enabled: true,
      hidden: false,
      text: "20 ",
      value: 20,
      items: [
        {"text":"5","value":5,"hidden":false,"enabled":true},
        {"text":"10","value":10,"hidden":false,"enabled":true},
        {"text":"20","value":20,"hidden":false,"enabled":true},
        {"text":"50","value":50,"hidden":false,"enabled":true},
        {"text":"100","value":100,"hidden":false,"enabled":true},
        {"text":"1000","value":1000,"hidden":false,"enabled":true},
        {"text":"All","value":-1,"hidden":false,"enabled":true}
      ]
    };
    console.log('retrieve JDR data');
  }

  public onSort() {
    console.log('onSort was called');
  }

  public onLoadNext() {
    console.log('onLoadNext was called');
  }

  public onItemSelect() {
    console.log('onItemSelect was called');
  }

  public onDonwloadClick(item) {
    console.log(item);
  }
}
