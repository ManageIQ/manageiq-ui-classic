class CloudVolumeSnapshotDecorator < MiqDecorator
  def self.fonticon
    'fa fa-camera'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
