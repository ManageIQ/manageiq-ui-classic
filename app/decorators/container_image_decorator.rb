class ContainerImageDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-image'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
