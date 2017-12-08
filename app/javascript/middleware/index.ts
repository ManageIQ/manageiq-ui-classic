import MwGenericPropertiesComponent from "./generic-ui";
import {GenericPropertiesService} from "./generic-ui/genericProperties.service";

ManageIQ.angular.app.service('genericPropertiesService', GenericPropertiesService);
ManageIQ.angular.app.component('mwGenericPropertiesComponent', new MwGenericPropertiesComponent());
