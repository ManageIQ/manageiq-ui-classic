module ManageIQ::Providers
  class StorageManager::CinderManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-openstack.svg"
    end
  end
end
