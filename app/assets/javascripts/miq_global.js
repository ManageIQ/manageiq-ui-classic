// global variables
if (! window.ManageIQ) {
  window.ManageIQ = {
    actionUrl: null, // action URL used in JS function miqGridSort
    afterOnload: null, // JS code to be evaluated after onload
    angular: {
      app: null, // angular application
      scope: null,  // helper scope, pending refactor
      rxSubject: null,  // an observable
      eventNotificationsData: null, // used by the notification drawer
    },
    browser: null, // browser name
    controller: null, // stored controller, used to build URL
    changes: null, // indicate if there are unsaved changes
    editor: null, // instance of CodeMirror editor
    timelineFilter: null, //
    toolbars: null, // toolbars
    oneTransition: {
      IEButtonPressed: false, // pressed save/reset button identificator
      oneTrans: null, // used to generate Ajax request only once for a drawn screen
    },
    noCollapseEvent: false, // enable/disable events fired after collapsing an accordion
    expEditor: {
      prefillCount: 0, //
      first: {
        title: null, //
        type: null, //
      },
      second: {
        title: null, //
        type: null, //
      },
    },
    calendar: { // TODO about to be removed
      calDateFrom: null, // to limit calendar starting
      calDateTo: null, // to limit calendar ending
      calSkipDays: null,  // to disable specific days of week
    },
    charts: {
      provider: null, // name of charting provider for provider-specific code
      chartData: null, // data for charts
      formatters: {}, // functions corresponding to MiqReport::Formatting
      c3: {}, // C3 charts by id
      c3config: null, // C3 chart configuration
    },
    explorer: {}, // methods to manipulate explorer screens through ExplorerPresenter
    grids: {}, // stored grids on the screen
    i18n: {
      mark_translated_strings: false,
    },
    mouse: {
      x: null, // mouse X coordinate for popup menu
      y: null, // mouse Y coordinate for popup menu
    },
    record: {
      parentClass: null, // parent record ID for JS function miqGridSort to build URL
      parentId: null, // parent record ID for JS function miqGridSort to build URL
      recordId: null, // record being displayed or edited
    },
    reportEditor: {
      valueStyles: null,
      prefillCount: 0,
    },
    widget: {
      dashboardUrl: null, // set dashboard widget drag drop url
      menuXml: null,
    },
    tree: {
      expandAll: true,
      clickUrl: null,
      checkUrl: null
    },
    gtl: {
      loading: null,
      isLast: null,
      isFirst: null
    },
    gridChecks: [], // list of checked checkboxes in current list grid
    observe: { // keeping track of data-miq_observe requests
      processing: false, // is a request currently being processed?
      queue: [], // a queue of pending requests
    },
    qe: {
      autofocus: 0, // counter of pending autofocus fields
      debounced: {}, // running debounces
      debounce_counter: 1,
    },
  };
}
