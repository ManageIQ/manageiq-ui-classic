class ServiceResourceDecorator < MiqDecorator
  def fonticon
    resource_type.to_s == 'VmOrTemplate' ? 'pficon pficon-virtual-machine' : 'pficon pficon-template'
  end
end
