class AvailabilityZoneDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-zone'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
