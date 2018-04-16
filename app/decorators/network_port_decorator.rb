class NetworkPortDecorator < MiqDecorator
  def self.fonticon
    'ff ff-network-port'
  end

  def self.fileicon
    '100/network_port.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
