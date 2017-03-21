module TextualMixins::TextualVmmInfo
  def textual_vmm_info
    h = {:label => _("VMM Information")}
    vmm_info = get_vmm_info
    if vmm_info.empty?
      h[:value] = _("None")
      h[:icon] = "fa fa-question-circle"
    else
      h[:image] = "svg/vendor-#{vmm_info[0][:description].downcase}.svg"
      h[:value] = vmm_info[0][:description]
      h[:title] = _("Show VMM information")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'hv_info')
    end
    h
  end

  def get_vmm_info
    hw_info = []
    if @record.respond_to?("vmm_vendor_display") # For Host table, this will pull the VMM fields
      hw_info.push(:vmminfo     => _("Vendor"),
                    :description => @record.vmm_vendor_display)
      hw_info.push(:vmminfo     => _("Product"),
                    :description => @record.vmm_product) unless @record.vmm_product.nil?
      hw_info.push(:vmminfo     => _("Version"),
                    :description => @record.vmm_version) unless @record.vmm_version.nil?
      hw_info.push(:vmminfo     => _("Build Number"),
                    :description => @record.vmm_buildnumber) unless @record.vmm_buildnumber.nil?
    end

    if @record.respond_to?("vendor_display") # For Vm table, this will pull the vendor and notes fields
      hw_info.push(:vmminfo     => _("Vendor"),
                    :description => @record.vendor_display)
      hw_info.push(:vmminfo     => _("Format"),
                    :description => @record.format) unless @record.format.nil?
      hw_info.push(:vmminfo     => _("Version"),
                    :description => @record.version) unless @record.version.nil?
      unless @record.hardware.nil?
        notes = if @record.hardware.annotation.nil?
                  _("<No notes have been entered for this VM>")
                else
                  @record.hardware.annotation
                end
        hw_info.push(:vmminfo     => _("Notes"),
                      :description => notes)
      end
    end
    hw_info
  end
end
