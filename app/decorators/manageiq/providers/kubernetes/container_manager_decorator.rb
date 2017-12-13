module ManageIQ::Providers::Kubernetes
  class ContainerManagerDecorator < ManageIQ::Providers::ContainerManagerDecorator
    def self.fileicon
      "svg/vendor-kubernetes.svg"
    end
  end
end
