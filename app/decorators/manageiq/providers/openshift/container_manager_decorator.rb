module ManageIQ::Providers::Openshift
  class ContainerManagerDecorator < MiqDecorator
    include ManageIQ::Providers::ContainerManagerDecoratorMixin

    def self.fileicon
      "svg/vendor-openshift.svg"
    end
  end
end
