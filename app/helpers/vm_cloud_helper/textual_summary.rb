module VmCloudHelper::TextualSummary
  include TextualMixins::TextualAdvancedSettings
  include TextualMixins::TextualDescription
  include TextualMixins::TextualDrift
  include TextualMixins::TextualFilesystems
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualInitProcesses
  include TextualMixins::TextualName
  include TextualMixins::TextualOsInfo
  include TextualMixins::TextualPatches
  include TextualMixins::TextualPowerState
  include TextualMixins::TextualProtected
  include TextualMixins::TextualRegion
  include TextualMixins::TextualScanHistory
  include TextualMixins::VmCommon
  # TODO: Determine if DoNav + url_for + :title is the right way to do links, or should it be link_to with :title

  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        name region server description ipaddress mac_address custom_1 container preemptible tools_status
        load_balancer_health_check_state osinfo architecture
      ] + (@record.type == 'ManageIQ::Providers::Amazon::CloudManager::Vm' ? %i[] : %i[snapshots]) +
      %i[
        advanced_settings resources guid virtualization_type root_device_type protected ems_ref
      ]
    )
  end

  def textual_group_security
    TextualGroup.new(_("Security"), %i[users groups patches key_pairs])
  end

  #
  # Items
  #
  def textual_power_state
    textual_power_state_whitelisted_with_template
  end

  def textual_ipaddress
    return nil if @record.template?
    ips = @record.ipaddresses
    {:label => n_("IP Address", "IP Addresses", ips.size), :value => ips.join(", ")}
  end

  def textual_preemptible
    preemptible = @record.try(:preemptible?)
    return nil if preemptible.nil?

    {
      :label => _("Preemptible"),
      :value => (preemptible ? _("Yes; VM will run at most 24 hours.") : _("No"))
    }
  end

  def textual_tools_status
    {:label => _("Platform Tools"), :value => (@record.tools_status.nil? ? _("N/A") : @record.tools_status)}
  end

  def textual_architecture
    bitness = @record.hardware&.bitness
    return nil if bitness.blank?
    {:label => _("Architecture"), :value => "#{bitness} bit"}
  end

  def textual_key_pairs
    return nil if @record.kind_of?(ManageIQ::Providers::CloudManager::Template)
    h = {:label => _("Key Pairs")}
    key_pairs = @record.key_pairs
    h[:value] = key_pairs.blank? ? _("N/A") : key_pairs.collect(&:name).join(", ")
    h
  end

  def textual_virtualization_type
    v_type = @record.hardware&.virtualization_type
    return nil if v_type.blank?
    {:label => _("Virtualization Type"), :value => v_type.to_s}
  end

  def textual_root_device_type
    rd_type = @record.hardware&.root_device_type
    return nil if rd_type.blank?
    {:label => _("Root Device Type"), :value => rd_type.to_s}
  end

  def textual_ems_ref
    return nil if @record.ems_ref.blank?
    {:label => _("ID within Provider"), :value => @record.ems_ref}
  end
end
