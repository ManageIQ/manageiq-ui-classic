module ManageIQ::Providers::StorageManager
  class SwiftManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-openstack.svg"
    end
  end
end
