module TextualMixins::TextualOsInfo
  def textual_osinfo
    h = {:label => _("Operating System")}
    product_name = @record.product_name
    if product_name.blank?
      os_image_name = @record.os_image_name
      if os_image_name.blank?
        h[:value] = _("Unknown")
      else
        h[:image] = "svg/os-#{os_image_name.downcase}.svg"
        h[:value] = os_image_name
      end
    else
      h[:image] = "svg/os-#{@record.os_image_name.downcase}.svg"
      h[:value] = product_name
      h[:title] = _("Show OS information")
      h[:explorer] = true
      h[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'os_info')
    end
    h
  end

  def get_os_info
    unless @record.operating_system.nil?
      os_info = []   # This will be an array of hashes to allow the rhtml to pull out each field by name
      account_policy = []   # This will be an array of hashes to allow the rhtml to pull out each field by name for account policy
      # add OS entry to the array
      os_info.push(:osinfo      => _("Operating System"),
                   :description => @record.operating_system.product_name) unless @record.operating_system.product_name.nil?
      os_info.push(:osinfo      => _("Service Pack"),
                   :description => @record.operating_system.service_pack) unless @record.operating_system.service_pack.nil?
      os_info.push(:osinfo      => _("Product ID"),
                   :description => @record.operating_system.productid) unless @record.operating_system.productid.nil?
      os_info.push(:osinfo      => _("Version"),
                   :description => @record.operating_system.version) unless @record.operating_system.version.nil?
      os_info.push(:osinfo      => _("Build Number"),
                   :description => @record.operating_system.build_number) unless @record.operating_system.build_number.nil?
      os_info.push(:osinfo      => _("System Type"),
                   :description => @record.operating_system.bitness.to_s + "-bit OS") unless @record.operating_system.bitness.nil?
      account_policy.push(:field       => _("Password History"),
                           :description => @record.operating_system.pw_hist) unless @record.operating_system.pw_hist.nil?
      account_policy.push(:field       => _("Max Password Age"),
                           :description => @record.operating_system.max_pw_age) unless @record.operating_system.max_pw_age.nil?
      account_policy.push(:field       => _("Min Password Age"),
                           :description => @record.operating_system.min_pw_age) unless @record.operating_system.min_pw_age.nil?
      account_policy.push(:field       => _("Min Password Length"),
                           :description => @record.operating_system.min_pw_len) unless @record.operating_system.min_pw_len.nil?
      account_policy.push(:field       => _("Password Complex"),
                           :description => @record.operating_system.pw_complex) unless @record.operating_system.pw_complex.nil?
      account_policy.push(:field       => _("Password Encrypt"),
                           :description => @record.operating_system.pw_encrypt) unless @record.operating_system.pw_encrypt.nil?
      account_policy.push(:field       => _("Lockout Threshold"),
                           :description => @record.operating_system.lockout_threshold) unless @record.operating_system.lockout_threshold.nil?
      account_policy.push(:field       => _("Lockout Duration"),
                           :description => @record.operating_system.lockout_duration) unless @record.operating_system.lockout_duration.nil?
      account_policy.push(:field       => _("Reset Lockout Counter"),
                           :description => @record.operating_system.reset_lockout_counter) unless @record.operating_system.reset_lockout_counter.nil?
    end
    [os_info, account_policy]
  end
end
