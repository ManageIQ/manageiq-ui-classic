class CloudSubnetDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-network'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
