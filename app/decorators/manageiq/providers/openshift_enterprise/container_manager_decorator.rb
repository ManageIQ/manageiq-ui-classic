module ManageIQ::Providers::OpenshiftEnterprise
  class ContainerManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-openshift_enterprise.svg"
    end
  end
end
