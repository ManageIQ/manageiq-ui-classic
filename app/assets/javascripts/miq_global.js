// global variables
if (!window.ManageIQ) {
  window.ManageIQ = {
    actionUrl: null, // action URL used in JS function miqGridSort
    afterOnload: null, // JS code to be evaluated after onload
    angular: {
      app: null, // angular application
      eventNotificationsData: null, // used by the notification drawer
      rxSubject: null,  // an observable
      form: null,  // $scope.angularForm, for miqCheckForChanges
    },
    browser: null, // browser name
    calendar: { // TODO about to be removed
      calDateFrom: null, // to limit calendar starting
      calDateTo: null, // to limit calendar ending
      calSkipDays: null,  // to disable specific days of week
    },
    changes: null, // indicate if there are unsaved changes
    charts: {
      c3: {}, // C3 charts by id
      c3config: null, // C3 chart configuration
      chartData: null, // data for charts
      formatters: {}, // functions corresponding to MiqReport::Formatting
      provider: null, // name of charting provider for provider-specific code
    },
    controller: null, // stored controller, used to build URL
    component: null, // Component API - app/javascript/miq-component
    editor: null, // instance of CodeMirror editor
    expEditor: {
      first: {
        title: null,
        type: null,
      },
      prefillCount: 0,
      second: {
        title: null,
        type: null,
      },
    },
    explorer: {}, // methods to manipulate explorer screens through ExplorerPresenter
    gridChecks: [], // list of checked checkboxes in current list grid
    grids: {}, // stored grids on the screen
    gtl: {
      isFirst: null,
      isLast: null,
      loading: null,
    },
    i18n: {
      mark_translated_strings: false,
    },
    logoutInProgress: false,  // prevent redirectLogin *during* logout
    mouse: {
      x: null, // mouse X coordinate for popup menu
      y: null, // mouse Y coordinate for popup menu
    },
    move: { //methods to move elements between Arrays or in an Array
    },
    noCollapseEvent: false, // enable/disable events fired after collapsing an accordion
    observe: { // keeping track of data-miq_observe requests
      processing: false, // is a request currently being processed?
      queue: [], // a queue of pending requests
    },
    oneTransition: {
      oneTrans: null, // used to generate Ajax request only once for a drawn screen
    },
    qe: {
      autofocus: 0, // counter of pending autofocus fields
      debounce_counter: 1,
      debounced: {}, // running debounces
    },
    record: {
      parentClass: null, // parent record ID for JS function miqGridSort to build URL
      parentId: null, // parent record ID for JS function miqGridSort to build URL
      recordId: null, // record being displayed or edited
    },
    redux: { // Redux API - app/javascript/miq-redux
      store: null,
      addReducer: null,
    },
    reportEditor: {
      prefillCount: 0,
      valueStyles: null,
    },
    toolbars: null,
    tree: {
      checkUrl: null,
      clickUrl: null,
      expandAll: true,
      data: {},
    },
    widget: {
      dashboardUrl: null, // set dashboard widget drag drop url
      menuXml: null,
    },
  };
}
