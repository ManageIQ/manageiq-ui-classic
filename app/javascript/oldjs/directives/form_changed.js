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
        if (_.isObject(copy) && _.isObject(original) && !_.isArray(copy) && !_.isArray(original)) {
          _.difference(Object.keys(original), Object.keys(copy)).forEach(function(k) {
            copy[k] = undefined;
          });
        }
        // don't compare ng stuff
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
        if (_.isEqualWith(model(), modelCopy(), compare)) {
          ctrl.$setPristine();
        } else {
          ctrl.$setDirty();
        }
      };

      scope.$watchCollection(ctrl.model || scope.model, updateDirty);
      // for cases that modelCopy is not created in same tick as any change of model
      scope.$watchCollection(ctrl.modelCopy || 'modelCopy', updateDirty);
      // for form elements which do not change the model (but do make the form dirty)
      scope.$watch(attr.name + '.$dirty', updateDirty);
    },
  };
});

