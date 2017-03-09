module ManageIQ::Providers
  class StorageManager::CinderManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-cinder.svg"
    end
  end
end
