class ResourcePoolDecorator < MiqDecorator
  def fonticon
    'pficon pficon-resource-pool'
  end

  def listicon_image
    vapp ? '100/vapp.png' : '100/resource_pool.png'
  end
end
