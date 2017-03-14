class ExtManagementSystemDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def listicon_image
    "svg/vendor-#{image_name}.svg"
  end
end
