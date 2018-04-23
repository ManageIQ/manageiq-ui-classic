class ContainerImageRegistryDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-registry'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
