import DialogEditorService from './dialogEditorService';
import DialogValidationService from './dialogValidationService';

export default (module) => {
  module.service('DialogEditor', DialogEditorService);
  module.service('DialogValidation', DialogValidationService);
};
