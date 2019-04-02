module TextualMixins::TextualRefreshStatus
  def textual_refresh_status
    last_refresh_status = @record.last_refresh_status.titleize
    if @record.last_refresh_date
      last_refresh_date = time_ago_in_words(@record.last_refresh_date.in_time_zone(Time.zone)).titleize
      last_refresh_status << _(" - %{last_refresh_date} Ago") % {:last_refresh_date => last_refresh_date}
    end
    {
      :label => _("Last Refresh"),
      :value => [{:value => last_refresh_status},
                 {:value => @record.last_refresh_error.try(:truncate, 120)}],
      :title => @record.last_refresh_error
    }
  end

  def textual_refresh_date
    last_refresh_date = @record.last_refresh_date ? @record.last_refresh_date.in_time_zone(Time.zone) : nil
    {:label => _("Last Refresh Date"), :value => last_refresh_date}
  end
end
