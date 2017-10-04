ManageIQ.angular.app.directive('formChanged', function() {
  return {
    require: 'form',
    link: function(scope, _elem, attr, ctrl) {
      var model = function() {
        return scope.$eval(ctrl.model || scope.model);
      };

      var modelCopy = function() {
        return scope.$eval(ctrl.modelCopy || 'modelCopy');
      };

      var empty = function(object) {
        return object === undefined || object === '' || object === null;
      };

      var compare = function(original, copy, key) {
        // add missing keys in copy from original so recursion works
        if (_.isObject(copy) && _.isObject(original)) {
          _.difference(Object.keys(original), Object.keys(copy)).forEach(function(k) {
            copy[k] = undefined;
          });
        }
        // don't compare ng stuff TODO remove in Angular 2/4
        if (key !== undefined && key[0] === '$') {
          return true;
        }
        if (empty(original) && empty(copy)) {
          return true;
        }
        // use default compare
        return undefined;
      };

      var updateDirty = function() {
        // TODO in lodash 4 it's _.isEqualWith
        if (_.isEqual(model(), modelCopy(), compare)) {
          ctrl.$setPristine();
        } else {
          ctrl.$setDirty();
        }
      };

      scope.$watchCollection(ctrl.model || scope.model, updateDirty);
      // for form elements which do not change the model (but do make the form dirty)
      scope.$watch(attr.name + '.$dirty', updateDirty);
    },
  };
});

