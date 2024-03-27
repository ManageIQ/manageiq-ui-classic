module TextualMixins::TextualOsInfo
  OsInfo = Struct.new(:osinfo, :description)
  AccountPolicy = Struct.new(:field, :description)

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

  def os_info_attributes
    os_info = []
    if @record.operating_system.present?
      os_info = {:product_name => _("Operating System"), :service_pack => _("Service Pack"),
                 :productid => _("Product ID"), :version => _("Version"), :build_number => _("Build Number"),
                 :bitness => _("System Type"), :name => _("Description")}.map do |method, title|
                   value = @record.operating_system.send(method)
                   value ? OsInfo.new(title, value) : next
                 end
    end
    os_info.compact
  end

  def account_policy_details
    policies = []
    if @record.operating_system.present?
      policies = {:pw_hist => _("Password History"), :max_pw_age => _("Max Password Age"),
                  :min_pw_age => _("Min Password Age"), :min_pw_len => _("Min Password Length"),
                  :pw_complex => _("Password Complex"), :pw_encrypt => _("Password Encrypt"),
                  :lockout_threshold => _("Lockout Threshold"), :lockout_duration => _("Lockout Duration"),
                  :reset_lockout_counter => _("Reset Lockout Counter")}.map do |method, title|
                    value = @record.operating_system.send(method)
                    value ? AccountPolicy.new(title, value) : next
                  end
    end
    policies.compact
  end

  def os_info_details
    os_info_attributes
  end
end
