class ServiceResourceDecorator < Draper::Decorator
  delegate_all

  def fonticon
    resource_type.to_s == 'VmOrTemplate' ? 'pficon pficon-virtual-machine' : 'product product-template'
  end

  def listicon_image
    "100/#{resource_type.to_s == 'VmOrTemplate' ? 'vm' : 'service_template'}.png"
  end
end
