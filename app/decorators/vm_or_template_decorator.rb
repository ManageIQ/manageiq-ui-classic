class VmOrTemplateDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end

  def supports_console?
    console_supported?('spice') || console_supported?('vnc')
  end

  def supports_cockpit?
    supports_launch_cockpit?
  end
end
