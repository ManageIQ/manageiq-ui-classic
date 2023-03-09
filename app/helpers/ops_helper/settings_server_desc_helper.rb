module OpsHelper::SettingsServerDescHelper
  private

  def settings_server_summary(server)
    rows = [
      row_data(_('Hostname'), server.hostname),
      row_data(_('IP Address'), server.ipaddress),
      row_data(_('Status'), server.status),
      row_data(_('Started On'), server.started_on.blank? ? "" : format_timezone(server.started_on)),
      row_data(_('Memory Usage'), server.memory_usage),
      row_data(_('Memory Size'), server.memory_size),
      row_data(_('CPU Time'), server.cpu_time),
      row_data(_('CPU Percent'), server.percent_cpu),
      row_data(_('Version / Build'), server.version),
    ]

    miq_structured_list({
                          :title => _(server.name),
                          :mode  => "settings_server_summary_info",
                          :rows  => rows
                        })
  end
end
