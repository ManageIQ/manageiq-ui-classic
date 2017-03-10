module ManageIQ::Providers::Kubernetes
  class ContainerManagerDecorator < MiqDecorator
    def listicon_image
      "svg/vendor-kubernetes.svg"
    end
  end
end
