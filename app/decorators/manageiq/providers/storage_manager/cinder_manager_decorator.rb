module ManageIQ::Providers
  class StorageManager::CinderManagerDecorator < MiqDecorator
    def self.listicon_image
      "svg/vendor-cinder.svg"
    end
  end
end
