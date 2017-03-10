module ManageIQ::Providers::Kubernetes
  class ContainerManagerDecorator < MiqDecorator
    def self.listicon_image
      "svg/vendor-kubernetes.svg"
    end
  end
end
