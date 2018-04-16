class NetworkRouterDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-route'
  end

  def self.fileicon
    '100/network_router.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
