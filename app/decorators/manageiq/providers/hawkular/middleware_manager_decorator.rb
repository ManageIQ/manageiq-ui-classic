module ManageIQ::Providers::Hawkular
  class MiddlewareManagerDecorator < MiqDecorator
    def self.fonticon
      nil
    end

    def self.listicon_image
      "svg/vendor-hawkular.svg"
    end
  end
end
