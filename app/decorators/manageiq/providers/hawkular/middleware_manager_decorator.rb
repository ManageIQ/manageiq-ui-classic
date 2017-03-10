module ManageIQ::Providers::Hawkular
  class MiddlewareManagerDecorator < MiqDecorator
    def fonticon
      nil
    end

    def listicon_image
      "svg/vendor-hawkular.svg"
    end
  end
end
