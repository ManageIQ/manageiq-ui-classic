module EmsAutomationHelper
  include TextualMixins::TextualRefreshStatus
  include TextualMixins::TextualGroupTags

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[url ipaddress zone]
    )
  end

  def textual_url
    {:label => _("URL"),
     :value => @record.url}
  end

  def textual_ipaddress
    {:label => _("IP Address"), :value => @record.ipaddress}
  end

  def textual_zone
    {:label => _("Zone"), :value => @record.my_zone}
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[configured_systems]
    )
  end

  def textual_configured_systems
    # label = _("Configured Systems")
    # num   = @record.number_of(:configured_systems)
    # h     = {:label => label, :icon => "pficon pficon-configured_system", :value => num}
    # if num.positive? && role_allows?(:feature => "configured_system_show_list")
    #   h[:link] = ems_infra_path(@record.id, :display => 'configured_systems', :vat => true)
    #   h[:title] = _("Show all %{label}") % {:label => label}
    # end
    # h
    textual_link(@record.configured_systems)
  end

  def textual_group_status
    TextualGroup.new(
      _("Status"),
      textual_authentications(@record.authentication_userid_passwords) + %i[refresh_status refresh_date]
    )
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_automation_path : ems_automation_path(ems)
  end
end
