module ManageIQ::Providers
  class StorageManager::SwiftManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-openstack.svg"
    end
  end
end
