module InfraNetworkingHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_('UNUSED?'), %i[switch_type])
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[hosts custom_button_events])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  #
  # Items
  #
  def textual_hosts
    num = @record.number_of(:hosts)
    h = {:label => _("Hosts"), :icon => "pficon pficon-container-node", :value => num}
    if num.positive? && role_allows?(:feature => "host_show_list")
      h[:explorer] = true
      h[:link] = url_for_only_path(:action => 'hosts', :id => @record, :db => 'switch')
    end
    h
  end

  def textual_custom_button_events
    return nil unless User.current_user.super_admin_user? || User.current_user.admin?

    {
      :label    => _('Custom Button Events'),
      :value    => num = @record.number_of(:custom_button_events),
      :link     => num.positive? ? url_for_only_path(:action => 'custom_button_events', :id => @record, :db => 'switch') : nil,
      :icon     => CustomButtonEvent.decorate.fonticon,
      :explorer => true
    }
  end
end
