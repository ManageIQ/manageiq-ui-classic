import * as _ from "lodash";

export class MwGenericView {
  constructor(public mwModel: any,
              public mwFields: any) {
    // Our Pojo
  }
}

export class GenericPropertiesService {

  static $inject = ['$http', '$q'];

  constructor(public $http: ng.IHttpService, private $q: any) {
  }

  public fetchFields(entity, fields): Promise<MwGenericView> {
    let deferred = this.$q.defer();
    console.info('Fetching data from /middleware_server/dynamic_ui for: ' + entity);
    console.info('Entity Fields to display: ' + fields);
    const displayFields = GenericPropertiesService.cleanupFields(fields);
    this.$http.get('/middleware_server/dynamic_ui/')
      .then((response) => {
        const jsonData = response.data;
        const selectedItem = this.selectItem(jsonData, entity);
        const mwModel = this.transformHawkularModelToFormly(selectedItem);
        const mwFields = this.createFormlyTemplateFields(selectedItem, displayFields);
        const mwGenericView = new MwGenericView(mwModel, mwFields);
        deferred.resolve(mwGenericView)
      });
    return deferred.promise;
  }

  private static cleanupFields(fields) {
    let fieldsNoSpaces = fields.replace(/ /g, '');
    let fieldsNoQuotes = fieldsNoSpaces.replace(/'/g, '');
    return fieldsNoQuotes.split(',');
  }

  private selectItem(hawkularJson, itemName) {
    return _.find(hawkularJson, (item) => {
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
    _.each(pickedItem, (value, prop) => {
      fields.push({key: prop, type: 'mw-input', templateOptions: {label: _.capitalize(prop)}});
    });
    return fields;
  }
}
