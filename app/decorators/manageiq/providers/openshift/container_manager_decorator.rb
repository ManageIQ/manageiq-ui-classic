module ManageIQ::Providers::Openshift
  class ContainerManagerDecorator < ManageIQ::Providers::ContainerManagerDecorator
    def self.fileicon
      "svg/vendor-openshift.svg"
    end
  end
end
