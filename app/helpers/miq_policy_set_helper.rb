module MiqPolicySetHelper
  def miq_summary_policy_set_info(record)
    data = {:title => _("Basic Information"), :mode => "miq_policy_set_info"}
    data[:rows] = [{:cells => {:label => _("Description"), :value => record.description}}]
    miq_structured_list(data)
  end

  def miq_summary_policy_set(profile_policies)
    data = {:title => _("Policies"), :mode => "miq_policy_set"}
    rows = []
    if profile_policies.empty?
      data[:message] = _("No Policies are defined.")
    else
      profile_policies.each do |p|
        cells = [{:icon => p.decorate.fonticon, :bold => true, :value => "#{ui_lookup(:model => p.towhat)} #{p.mode.capitalize}"}]
        cells.push(p.description)
        rows.push({
                    :cells   => cells,
                    :title   => _("View this %{model} Policy") % {:model => ui_lookup(:model => p.towhat)},
                    :onclick => {:url => "/miq_policy/show/#{p.id}"},
                  })
      end
      data[:rows] = rows
    end
    miq_structured_list(data)
  end

  def miq_summary_policy_set_notes(record)
    data = {:title => _("Notes"), :mode => "miq_policy_set_notes"}
    rows = []
    if record.set_data.present? && (record.set_data[:notes] || record.set_data["notes"])
      if record.set_data[:notes].blank? && record.set_data["notes"].blank?
        data[:message] = _("No notes have been entered.")
      else
        rows.push({:cells => {:value => {:input => "text_area", :text => record.set_data[:notes] || record.set_data["notes"], :readonly => true, :rows => 4}}})
      end
    else
      data[:message] = _("No notes have been entered.")
    end
    data[:rows] = rows
    miq_structured_list(data)
  end
end
