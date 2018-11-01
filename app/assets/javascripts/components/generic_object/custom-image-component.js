ManageIQ.angular.app.component('customImageComponent', {
  bindings: {
    picture: '=',
    newRecord: '<',
    angularForm: '<',
    pictureUrlPath: '@',
    pictureUploaded: '=',
    pictureRemove: '=',
    pictureReset: '<',
  },
  controllerAs: 'vm',
  controller: customImageComponentController,
  templateUrl: '/static/generic_object/custom-image-component.html.haml',
});

customImageComponentController.$inject = ['$timeout'];

function customImageComponentController($timeout) {
  var vm = this;

  vm.$onInit = function() {
    vm.imageUploadStatus = '';
    vm.changeImage = false;
  };

  vm.$onChanges = function(changes) {
    if (changes.pictureReset) {
      vm.changeImage = false;
      restoreOriginalStatus();
    }
  };

  vm.uploadClicked = function() {
    var imageFile;

    if (angular.element('#generic_object_definition_image_file')[0].files.length === 0) {
      return;
    }

    imageFile = angular.element('#generic_object_definition_image_file')[0].files[0];

    var reader = new FileReader();
    vm.imageUploadStatus = '';

    if (imageFile.type === 'image/png') {
      vm.picture.extension = 'png';
    } else if (imageFile.type === 'image/jpg' || imageFile.type === 'image/jpeg') {
      vm.picture.extension = 'jpg';
    } else if (imageFile.type === 'image/svg') {
      vm.picture.extension = 'svg';
    } else {
      vm.angularForm.generic_object_definition_image_file_status.$setValidity('incompatibleFileType', false);
      vm.imageUploadStatus = __('Incompatible image type');
      vm.pictureUploaded = true;
      return;
    }

    reader.onload = function(event) {
      vm.picture.content = btoa(event.target.result);

      $timeout(function() {
        vm.angularForm.generic_object_definition_image_file_status.$setValidity('incompatibleFileType', true);
        vm.imageUploadStatus = __('Image is ready to be uploaded');
        vm.pictureUploaded = true;
      });
    };

    if (imageFile) {
      reader.readAsBinaryString(imageFile);
    }
  };

  vm.changeImageSelected = function() {
    if (! vm.changeImage) {
      restoreOriginalStatus();
    }
  };

  vm.removeImage = function() {
    Object.assign(vm.picture, {});
    vm.pictureRemove = true;
  };

  function restoreOriginalStatus() {
    if (vm.angularForm.generic_object_definition_image_file_status) {
      vm.angularForm.generic_object_definition_image_file_status.$setValidity('incompatibleFileType', true);
    }
    vm.imageUploadStatus = '';
    angular.element(':file').filestyle('clear');
  }
}
