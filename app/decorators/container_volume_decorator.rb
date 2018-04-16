class ContainerVolumeDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-volume'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
