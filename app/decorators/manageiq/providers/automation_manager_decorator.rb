module ManageIQ::Providers
  class AutomationManagerDecorator < Draper::Decorator
    delegate_all

    def fonticon
      nil
    end

    def listicon_image
      "svg/vendor-#{image_name.downcase}.svg"
    end
  end
end
