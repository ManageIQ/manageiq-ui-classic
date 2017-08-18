class VmOrTemplateDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-virtual-machine'
  end

  def fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end
end
