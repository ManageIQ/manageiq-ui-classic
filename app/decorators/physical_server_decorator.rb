class PhysicalServerDecorator < MiqDecorator
  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end

  def self.fonticon
    'pficon pficon-server'
  end
end
