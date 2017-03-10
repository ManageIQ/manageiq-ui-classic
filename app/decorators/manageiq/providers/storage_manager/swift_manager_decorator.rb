module ManageIQ::Providers
  class StorageManager::SwiftManagerDecorator < MiqDecorator
    def self.listicon_image
      "svg/vendor-swift.svg"
    end
  end
end
