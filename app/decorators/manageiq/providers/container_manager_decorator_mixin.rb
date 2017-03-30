module ManageIQ::Providers
  module ContainerManagerDecoratorMixin
    def displayable_custom_attribute_sections
      ['metadata']
    end
  end
end
