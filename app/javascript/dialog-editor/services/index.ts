import DialogEditorService from './dialogEditorService';
import DialogValidationService from './dialogValidationService';

export default (module: ng.IModule) => {
  module.service('DialogEditor', DialogEditorService);
  module.service('DialogValidation', DialogValidationService);
};
