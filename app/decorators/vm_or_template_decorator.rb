class VmOrTemplateDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end
end
