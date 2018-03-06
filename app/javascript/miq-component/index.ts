import {
  define,
  newInstance,
  getInstance,
  isDefined,
} from './registry';

export default () => {
  // initialize the namespace, don't wait for application startup
  ManageIQ.component = {
    define,
    newInstance,
    getInstance,
    isDefined
  };
};
