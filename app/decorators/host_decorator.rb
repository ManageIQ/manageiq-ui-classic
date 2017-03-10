class HostDecorator < MiqDecorator
  def fonticon
    'pficon pficon-screen'
  end

  def listicon_image
    "svg/vendor-#{vmm_vendor_display.downcase}.svg"
  end
end
