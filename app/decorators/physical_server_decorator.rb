class PhysicalServerDecorator < MiqDecorator
  def fileicon
    "svg/vendor-#{label_for_vendor.downcase}.svg"
  end

  def self.fonticon
    'pficon pficon-server'
  end
end
