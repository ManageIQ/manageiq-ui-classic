ErrorModalController.$inject = ['$timeout'];
function ErrorModalController($timeout) {
  var $ctrl = this;
  $ctrl.data = null;
  $ctrl.error = null;
  $ctrl.isHtml = false;

  ManageIQ.angular.rxSubject.subscribe(function(event) {
    if ('serverError' in event) {
      $timeout(function() {
        $ctrl.show(event.serverError, event.source);
      });
    }
  });

  function findError(data) {
    // find the exception in our miq rails error screen
    var m = data.match(/<h2>\s*Error text:\s*<\/h2>\s*<br>\s*<h3>\s*(.*?)\s*<\/h3>/);
    if (m) {
      return m[1];
    }

    // the same in JS-encoded form
    m = data.match(/\\u003ch2\\u003e\\nError text:\\n\\u003c\/h2\\u003e\\n\\u003cbr\\u003e\\n\\u003ch3\\u003e\\n(.*?)\\n\\u003c\/h3\\u003e/);
    if (m) {
      return m[1];
    }

    // no luck
    return data;
  }

  $ctrl.show = function(err, source) {
    if (!err || !_.isObject(err)) {
      return;
    }

    if (source === 'API') {
      $ctrl.contentType = err.headers.get("content-type");
      $ctrl.url = err.url;
    } else if (source === '$http') {
      $ctrl.contentType = err.headers('content-type');
      $ctrl.url = err.config.url;
    }

    $ctrl.error = err;
    $ctrl.source = source;
    $ctrl.data = err.data;
    $ctrl.isHtml = ($ctrl.contentType || "").match('text/html');

    // special handling for our error screen
    if ($ctrl.isHtml && $ctrl.data) {
      $ctrl.data = findError($ctrl.data);
    }

    $ctrl.status = (err.status !== -1) ? err.status + " " + err.statusText : "Server not responding";
  };

  $ctrl.close = function() {
    $ctrl.error = null;
  };
}

angular.module('miq.error', [])
  .component('errorModal', {
    controller: ErrorModalController,

    // inlining the template because it may be harder to GET when the server is down
    template: [
      '<div id="errorModal" ng-class="{ ' + "'modal-open'" + ': $ctrl.error }">',
      '  <div class="modal" ng-class="{ show: $ctrl.error }">',
      '    <div class="modal-dialog">',
      '      <div class="modal-content error-modal-miq">',
      '        <div class="modal-header">',
      '          <button class="close" ng-click="$ctrl.close()">',
      '            <span class="pficon pficon-close">',
      '            </span>',
      '          </button>',
      '          <h4 class="modal-title">',
      '            Server Error {{$ctrl.source && "(" + $ctrl.source + ")"}}',
      '          </h4>',
      '        </div>',
      '        <div class="modal-body">',
      '          <div class="col-xs-12 col-md-2">',
      '            <i class="error-icon pficon-error-circle-o"></i>',
      '          </div>',
      '          <div class="col-xs-12 col-md-10">',
      '            <p ng-if="$ctrl.url">',
      '              <strong>',
      '                URL',
      '              </strong>',
      '              {{$ctrl.url}}',
      '            </p>',
      '            <p>',
      '              <strong>',
      '                Status',
      '              </strong>',
      '              {{$ctrl.status}}',
      '            </p>',
      '            <p>',
      '              <strong>',
      '                Content-Type',
      '              </strong>',
      '              {{$ctrl.contentType}}',
      '            </p>',
      '            <p>',
      '              <strong>',
      '                Data',
      '              </strong>',
      '              {{$ctrl.data}}',
      '            </p>',
      '          </div>',
      '        </div>',
      '        <div class="modal-footer">',
      '          <button type="button" class="btn btn-primary" ng-click="$ctrl.close()">Close</button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join("\n"),
  });

$(function() {
  var element = $('<error-modal>');
  element.appendTo(window.document.body);

  miq_bootstrap(element, 'miq.error');
});
