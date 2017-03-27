module ManageIQ::Providers
  class ConfigurationManagerDecorator < MiqDecorator
    def self.fonticon
      nil
    end

    def fileicon
      "svg/vendor-#{image_name.downcase}.svg"
    end
  end
end
