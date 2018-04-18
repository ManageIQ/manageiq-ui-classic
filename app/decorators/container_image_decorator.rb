class ContainerImageDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-image'
  end

  def self.fileicon
    '100/container_image.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
