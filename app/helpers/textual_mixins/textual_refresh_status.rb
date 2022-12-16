module TextualMixins::TextualRefreshStatus
  include ActionView::Helpers::DateHelper
  def textual_refresh_status
    refresh_status(@record)
  end

  def textual_refresh_date
    refresh_date(@record)
  end

  def status_type(status, time)
    stale = time ? time.before?(2.days.ago) : true
    notification = {:type => status, :stale => stale}
    notification[:type] = 'warning' if status == 'success' && time&.before?(2.days.ago)
    notification
  end

  def refresh_status(record)
    refresh_status = record.last_refresh_status
    refresh_time = record.last_refresh_date
    status_title = refresh_status&.titleize
    if refresh_time
      last_refresh_date = refresh_time ? time_ago_in_words(refresh_time).titleize : _('Never')
      status_title << (_(" - %{last_refresh_date} Ago") % {:last_refresh_date => last_refresh_date})
    end
    notification = status_type(refresh_status, refresh_time)
    {
      :label  => _("Last Refresh Status"),
      :value  => [{:value => status_title},
                  {:value => record.last_refresh_error.try(:truncate, 120)}],
      :title  => record.last_refresh_error,
      :status => notification[:type],
      :stale  => notification[:stale]
    }
  end

  def refresh_date(record)
    last_refresh_date = record.last_refresh_date
    {:label => _("Last Refresh Date"), :value => last_refresh_date}
  end
end
