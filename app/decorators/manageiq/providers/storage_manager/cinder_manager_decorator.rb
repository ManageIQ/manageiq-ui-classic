module ManageIQ::Providers
  class StorageManager::CinderManagerDecorator < MiqDecorator
    def self.fileicon
      "svg/vendor-cinder.svg"
    end
  end
end
