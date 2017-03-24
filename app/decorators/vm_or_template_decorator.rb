class VmOrTemplateDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def listicon_image
    "svg/vendor-#{vendor.downcase}.svg"
  end
end
