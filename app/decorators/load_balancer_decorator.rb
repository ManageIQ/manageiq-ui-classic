class LoadBalancerDecorator < MiqDecorator
  def self.fonticon
    'ff ff-load-balancer'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
