module ManageIQ::Providers::Kubernetes
  class ContainerManagerDecorator < MiqDecorator
    include ManageIQ::Providers::ContainerManagerDecoratorMixin

    def self.fileicon
      "svg/vendor-kubernetes.svg"
    end
  end
end
