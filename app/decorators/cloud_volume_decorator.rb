class CloudVolumeDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-volume'
  end

  def self.fileicon
    '100/cloud_volume.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
