class CloudNetworkDecorator < MiqDecorator
  def self.fonticon
    'ff ff-cloud-network'
  end

  def self.fileicon
    '100/cloud_network.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
