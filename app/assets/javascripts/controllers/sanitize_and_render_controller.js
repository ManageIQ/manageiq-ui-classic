angular
  .module('sanitizeRender', ['ngSanitize'])
  .controller('SanitizeAndRenderController', ['$sce', function SanitizeAndRenderCtrl($sce) {
    var vm = this;
    vm.sanitizeRenderHtml = function(str) {
      return $sce.trustAsHtml(decodeURI(str));
    };
  }]);
