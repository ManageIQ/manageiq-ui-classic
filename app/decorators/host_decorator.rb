class HostDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-screen'
  end

  def fileicon
    "svg/vendor-#{vmm_vendor_display.downcase}.svg"
  end
end
