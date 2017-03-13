module ManageIQ::Providers
  class ConfigurationManagerDecorator < MiqDecorator
    def self.fonticon
      nil
    end

    def listicon_image
      "svg/vendor-#{image_name.downcase}.svg"
    end
  end
end
