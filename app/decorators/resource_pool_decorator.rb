class ResourcePoolDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-resource-pool'
  end

  def fileicon
    vapp ? '100/vapp.png' : '100/resource_pool.png'
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
