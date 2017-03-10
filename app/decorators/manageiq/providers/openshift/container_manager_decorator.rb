module ManageIQ::Providers::Openshift
  class ContainerManagerDecorator < MiqDecorator
    def self.listicon_image
      "svg/vendor-openshift.svg"
    end
  end
end
