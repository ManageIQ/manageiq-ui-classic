module MiqAlertSetHelper
  def miq_summary_alert_set(alert_profile_alerts)
    rows = []
    data = {:title => _('Alerts'), :mode => "miq_alert_set"}
    if alert_profile_alerts.empty?
      data[:message] = _("No Alerts are defined.")
    else
      alert_profile_alerts.each do |a|
        rows.push({
                    :cells   => [{:icon => 'pficon pficon-warning-triangle-o', :value => h(a.description)}],
                    :title   => _("View this Alert"),
                    :onclick => "DoNav('/miq_alert/show/#{a.id}');",
                  })
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end
end
