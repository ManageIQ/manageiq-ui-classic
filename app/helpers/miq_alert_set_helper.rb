module MiqAlertSetHelper
  def miq_summary_alert_set_info(alert_profile)
    rows = []
    data = {:title => _('Basic Information'), :mode => "miq_alert_set_info"}
    rows.push({:cells => {:label => _("Description"), :value => alert_profile.description}})
    rows.push({:cells => {:label => _("Mode"), :value => MiqAlertSet::ALERT_SET_MODES[alert_profile.mode]}})
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_alert_set_assigned(assigned, alert_profile_tag)
    rows = []
    data = {:title => _('Assigned To'), :mode => "miq_alert_set_assigned"}
    if !assigned[:objects].empty?
      if assigned[:objects].first.kind_of?(MiqEnterprise)
        rows.push({:cells => {:label => _('The Enterprise')}})
      else
        objs = []
        assigned[:objects].each do |o|
          if o.kind_of?(EmsFolder)
            objs.push({:value => "#{o.ext_management_system.name}/#{o.folder_path(:exclude_root_folder => true, :exclude_non_display_folders => true)}"})
          elsif o.kind_of?(ResourcePool)
            objs.push({:value => o.absolute_path(:exclude_hidden => true)})
          else
            objs.push({:value => o.name})
          end
        end
        rows.push({:cells => {:label => ui_lookup(:models => assigned[:objects].first.class.to_s), :value => objs}})
      end
    elsif !assigned[:tags].empty?
      assigned_tags_label = _("%{alert_profiles} with %{type} Tags") % {:alert_profiles => ui_lookup(:tables => assigned[:tags].first.last), :type => alert_profile_tag.description}
      assigned_tags_value = []
      assigned[:tags].sort_by { |a| a.first.description.downcase }.each do |tag|
        assigned_tags_value.push({:value => tag.first.description})
      end
      rows.push({:cells => {:label => assigned_tags_label, :value => assigned_tags_value}})
    else
      rows.push({:cells => {:label => _('Nothing')}})
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_alert_set_notes(alert_profiles)
    data = {:title => _("Notes"), :mode => "miq_alert_set_notes", :rows => []}
    if alert_profiles.notes.blank?
      data[:message] = _("No notes have been entered.")
    else
      data[:rows] = [{:cells => {:value => {:input => "text_area", :text => alert_profiles.notes, :readonly => true, :rows => 4}}}]
    end
    miq_structured_list(data)
  end

  def miq_summary_alert_set_alerts(alert_profile_alerts)
    rows = []
    data = {:title => _('Alerts'), :mode => "miq_alert_set"}
    if alert_profile_alerts.empty?
      data[:message] = _("No Alerts are defined.")
    else
      alert_profile_alerts.each do |a|
        rows.push({
                    :cells   => [{:icon => 'pficon pficon-warning-triangle-o', :value => a.description}],
                    :title   => _("View this Alert"),
                    :onclick => {:url => "/miq_alert/show/#{a.id}"},
                  })
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end
end
