Last login: Tue Mar  6 09:43:46 on ttys003
rejpal33:~ swi2$ cd utery/manageiq-ui-classic/app/assets/
images/      javascripts/ stylesheets/ 
rejpal33:~ swi2$ cd utery/manageiq-ui-classic/app/assets/javascripts/
rejpal33:javascripts swi2$ cd controllers/
rejpal33:controllers swi2$ ag security_group/security_group_form_controller.js 
rejpal33:controllers swi2$ nano security_group/security_group_form_controller.js 
















  GNU nano 2.0.6 File: ...ity_group/security_group_form_controller.js           

      }
    }
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = miqService.get
