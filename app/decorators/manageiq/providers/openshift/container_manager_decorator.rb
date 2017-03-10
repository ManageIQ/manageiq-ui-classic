module ManageIQ::Providers::Openshift
  class ContainerManagerDecorator < MiqDecorator
    def self.listicon_image
      "svg/vendor-openshift.svg"
    end

    def listicon_image
      self.class.listicon_image
    end
  end
end
