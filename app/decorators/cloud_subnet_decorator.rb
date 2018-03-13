class CloudSubnetDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-network'
  end

  def self.fileicon
    '100/cloud_subnet.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
