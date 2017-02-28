module ManageIQ::Providers::Openshift
  class ContainerManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-openshift.svg"
    end
  end
end
