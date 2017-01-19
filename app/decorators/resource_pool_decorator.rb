class ResourcePoolDecorator < Draper::Decorator
  delegate_all

  def fonticon
    "pficon pficon-resource-pool"
  end

  def listicon_image
    "100/#{vapp ? 'vapp' : 'resource_pool'}.png"
  end
end
