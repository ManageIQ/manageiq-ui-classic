class ContainerRouteDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-route'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
