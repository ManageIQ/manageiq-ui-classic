class ExtManagementSystemDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{image_name}.svg"
  end
end
