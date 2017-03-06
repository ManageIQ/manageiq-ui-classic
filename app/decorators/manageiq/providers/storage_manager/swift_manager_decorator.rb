module ManageIQ::Providers
  class StorageManager::SwiftManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-swift.svg"
    end
  end
end
