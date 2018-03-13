class ContainerVolumeDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-volume'
  end

  def single_quad
    {
      :fileicon => '100/container_volume.png'
    }
  end
end
