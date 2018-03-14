class ContainerImageRegistryDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-registry'
  end

  def self.fileicon
    '100/container_image_registry.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
