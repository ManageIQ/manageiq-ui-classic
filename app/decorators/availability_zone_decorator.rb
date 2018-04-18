class AvailabilityZoneDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-zone'
  end

  def self.fileicon
    '100/availability_zone.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
