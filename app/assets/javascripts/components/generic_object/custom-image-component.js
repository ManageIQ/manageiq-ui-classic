ManageIQ.angular.app.component('customImageComponent', {
  bindings: {
    picture: '=',
    newRecord: '<',
    angularForm: '<',
    pictureUrlPath: '@',
    pictureUploaded: '=',
  },
  controllerAs: 'vm',
  controller: customImageComponentController,
  templateUrl: '/static/generic_object/custom-image-component.html.haml',
});

customImageComponentController.$inject = ['$timeout'];

function customImageComponentController($timeout) {
  var vm = this;

  vm.$onInit = function() {
    vm.imageUploadStatus = "";
    vm.changeImage = false;
  };

  vm.uploadClicked = function() {
    var imageFile;

    if (angular.element('#generic_object_definition_image_file')[0].files.length === 0) {
      return;
    } else {
      imageFile = angular.element('#generic_object_definition_image_file')[0].files[0];
    }

    var reader = new FileReader();
    vm.imageUploadStatus = "";

    if (imageFile.type === 'image/png') {
      vm.picture.extension = 'png';
    } else if (imageFile.type === 'image/jpg') {
      vm.picture.extension = 'jpg';
    } else if (imageFile.type === 'image/jpeg') {
      vm.picture.extension = 'jpeg';
    } else {
      vm.angularForm.generic_object_definition_image_file_status.$setValidity("incompatibleFileType", false);
      vm.imageUploadStatus = __("Incompatible image type");
      return;
    }

    reader.onload = function(event) {
      vm.picture.content = btoa(event.target.result);

      $timeout(function(){
        vm.angularForm.generic_object_definition_image_file_status.$setValidity("incompatibleFileType", true);
        vm.imageUploadStatus = __("Image upload complete");
        vm.pictureUploaded = true;
      });
    };

    if (imageFile) {
      reader.readAsBinaryString(imageFile);
    }
  };

  vm.changeImageSelected = function() {
    if (!vm.changeImage) {
      vm.angularForm.generic_object_definition_image_file_status.$setValidity("incompatibleFileType", true);
      vm.imageUploadStatus = "";
      angular.element(":file").filestyle('clear');
    }
  };
}
