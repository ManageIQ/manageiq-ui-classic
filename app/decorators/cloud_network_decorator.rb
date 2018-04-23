class CloudNetworkDecorator < MiqDecorator
  def self.fonticon
    'ff ff-cloud-network'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
