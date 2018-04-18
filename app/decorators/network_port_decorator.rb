class NetworkPortDecorator < MiqDecorator
  def self.fonticon
    'ff ff-network-port'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
