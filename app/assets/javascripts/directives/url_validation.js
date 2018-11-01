ManageIQ.angular.app.directive('urlValidation', ['nodeValidator', function(nodeValidator) {
  return {
    require: 'ngModel',
    link: function(_scope, _elem, _attrs, ctrl) {
      ctrl.$validators.urlValidation = function(modelValue, viewValue) {
        if (! viewValue) {
          return true;
        }
        return !! validUrl(viewValue);
      };
      var options = {
        protocols: ['http', 'https', 'ssh'],
        require_tld: true,
        require_protocol: true,
        require_valid_protocol: true,
        allow_underscores: true,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: true,
      };
      var validUrl = function(url) {
        return nodeValidator.isURL(url, options) || url.match(/^[-\w:.]+@.*:/);
      };
    },
  };
}]);
