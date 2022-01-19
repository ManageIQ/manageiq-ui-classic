module MiqAlertHelper
  def miq_summary_belongs_to_alert_profile(alert_profiles)
    rows = []
    data = {:title => _('Belongs to Alert Profiles'), :mode => "miq_alert_profiles"}
    if alert_profiles.blank?
      data[:message] = _("This Alert is not assigned to any Alert Profiles.")
    else
      alert_profiles.each do |ap|
        rows.push({
                    :cells   => [{:icon => 'pficon pficon-warning-triangle-o', :value => h(ap.description)}],
                    :title   => _("View this Alert Profile"),
                    :onclick => "DoNav('/miq_alert_set/show/#{ap.id}');",
                  })
      end
      data[:rows] = rows
    end
    miq_structured_list(data)
  end
end
