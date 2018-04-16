class PersistentVolumeDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-volume'
  end

  def self.fileicon
    '100/persistent_volume.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
