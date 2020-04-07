import { fields } from './toolbox.js';

// used as a toolbox for the Dialog Editor
export const Toolbox = {
  controller() {
    this.fields = fields;
  },
  template: require('./toolbox.html'),
};
