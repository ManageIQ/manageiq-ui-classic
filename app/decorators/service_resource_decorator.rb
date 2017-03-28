class ServiceResourceDecorator < MiqDecorator
  def fonticon
    resource_type.to_s == 'VmOrTemplate' ? 'pficon pficon-virtual-machine' : 'product product-template'
  end

  def fileicon
    resource_type.to_s == 'VmOrTemplate' ? '100/vm.png' : '100/service_template.png'
  end
end
