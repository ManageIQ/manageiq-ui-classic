class ContainerRouteDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-route'
  end

  def self.fileicon
    '100/container_route.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
