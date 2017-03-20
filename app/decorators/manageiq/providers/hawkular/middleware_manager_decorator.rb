module ManageIQ::Providers::Hawkular
  class MiddlewareManagerDecorator < MiqDecorator
    def self.fonticon
      nil
    end

    def self.fileicon
      "svg/vendor-hawkular.svg"
    end
  end
end
