import * as ng from 'angular';
import * as _ from "lodash";
import {GenericPropertiesService, MwGenericView} from "./genericProperties.service";
import {_finally} from "rxjs/operator/finally";

export default class MwGenericPropertiesComponent implements ng.IComponentOptions {
  public template = ` <formly-form model="$ctrl.mwModel" fields="$ctrl.mwFields"></formly-form>`;
  public controller: any = MwGenericPropertiesController;
  public bindings: any = {
    entity: '@',
    fields: '@',
  };
}

interface MwTextualSummaryDisplayModel {
  mwModel: any;
  mwFields: any;
}

class MwGenericPropertiesController implements MwTextualSummaryDisplayModel {
  public mwModel: any = [];
  public mwFields: any = {};

  public static $inject = ['genericPropertiesService', 'miqService'];

  constructor(private genericPropertiesService: GenericPropertiesService,
              private miqService: any) {
    /// initializers - non yet
  }

  $onInit() {
    this.loadJson(this.entity, this.fields);
  }

  private loadJson(entity, fields) {
    this.miqService.sparkleOn();
    this.genericPropertiesService.fetchFields(entity, fields)
      .then((response) => {
        const mwGenericView: MwGenericView = response;
        this.mwModel = mwGenericView.mwModel;
        this.mwFields = mwGenericView.mwFields;
        this.miqService.sparkleOff();
      })
      .catch(this.miqService.handleFailure);
  }
}




