class LoadBalancerDecorator < MiqDecorator
  def self.fonticon
    'ff ff-load-balancer'
  end

  def self.fileicon
    '100/load_balancer.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
