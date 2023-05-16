module TextualMixins::TextualVmmInfo
  VmmInfo = Struct.new(:vmminfo, :description)

  def textual_vmm_info
    h = {:label => _("VMM Information")}
    vmm_info = vmm_info_details
    if vmm_info.empty?
      h[:value] = _("None")
      h[:icon] = "fa fa-question-circle"
    else
      h[:image] = @record.decorate.fileicon
      h[:value] = vmm_info[0][:description]
      h[:title] = _("Show VMM information")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'hv_info')
    end
    h
  end

  def host_vendor_details
    {:vmm_vendor_display => _("Vendor"), :vmm_product => _("Product"), :vmm_version => _("Version"),
     :vmm_buildnumber => _("Build Number")}.map do |method, title|
      value = @record.send(method)
      value ? VmmInfo.new(title, value) : next
    end.compact
  end

  def vm_vendor_details
    {:vendor_display => _("Vendor"), :format => _("Format"), :version => _("Version"),
     :annotation => _("Notes")}.map do |method, title|
      if method == :annotation
        if @record.hardware
          value = @record.hardware.send(method)
          value ? VmmInfo.new(title, value) : VmmInfo.new(title, _("<No notes have been entered for this VM>"))
        else
          next
        end
      else
        value = @record.send(method)
        value ? VmmInfo.new(title, value) : next
      end
    end.compact
  end

  def vmm_info_details
    vmm_info = []
    if @record.respond_to?(:vmm_vendor_display)
      vmm_info = host_vendor_details
    end

    if @record.respond_to?(:vendor_display)
      vmm_info = vm_vendor_details
    end
    vmm_info
  end
end
