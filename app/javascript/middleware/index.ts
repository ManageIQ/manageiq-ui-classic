import * as ng from 'angular';

export default class MwGenericPropertiesComponent implements ng.IComponentOptions {
  public template: '<form><formly-form model="$ctrl.mwModel" fields="$ctrl.mwFields"></formly-form></form>';
  public controller: any = MwGenericPropertiesController;
  public bindings: any = {
    entity: '@',
    fields: '@',
  };
}

class MwGenericPropertiesController {
  public mwModel: any = [];
  public mwFields: any = [];

  public static $inject = ['$http', 'miqService'];

  constructor(private $http: ng.IHttpService,
              private miqService: any) {
    /// initializers - non yet
  }

  $onInit() {
    this.loadJson(this.entity, this.fields);
  }

  public loadJson(entity, fields) {
    console.info('Fetching data from /middleware_server/dynamic_ui for: ' + entity);
    console.info('Entity Fields to display: ' + fields);
    let fieldsNoSpaces = fields.replace(/ /g, '');
    let fieldsNoQuotes = fieldsNoSpaces.replace(/'/g, '');
    const displayFields = fieldsNoQuotes.split(',');
    this.miqService.sparkleOn();
    this.$http.get('/middleware_server/dynamic_ui/')
      .then((response) => {
        const jsonData = response.data;
        const selectedItem = this.selectItem(jsonData, entity);
        this.mwModel = this.transformHawkularModelToFormly(selectedItem);
        this.mwFields = this.createFormlyTemplateFields(selectedItem, displayFields);
        this.miqService.sparkleOff();
      })
      .catch(this.miqService.handleFailure);
  }

  private selectItem(hawkularJson, itemName) {
    return _.find(hawkularJson, function (item) {
      return item.name === itemName;
    });
  }

  private transformHawkularModelToFormly(item) {
    let tranformedItem = item;
    // placeholder for model mutations
    return tranformedItem;
  }

  private createFormlyTemplateFields(item, displayFields) {
    let fields = [];
    const pickedItem = _.pick(item, displayFields);
    _.each(pickedItem, function (value, prop) {
      fields.push({key: prop, type: 'mw-input', templateOptions: {label: _.capitalize(prop)}});
    });
    return fields;
  }
}

ManageIQ.angular.app.component('mwGenericPropertiesComponent', new MwGenericPropertiesComponent());


