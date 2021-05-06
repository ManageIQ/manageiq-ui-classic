module TextualMixins::TextualRefreshStatus
  include ActionView::Helpers::DateHelper
  def textual_refresh_status
    refresh_status(@record)
  end

  def textual_refresh_date
    refresh_date(@record)
  end

  def refresh_status(record)
    last_refresh_status = record.last_refresh_status&.titleize
    refresh_time = record.last_refresh_date
    if refresh_time
      last_refresh_date = refresh_time ? time_ago_in_words(refresh_time).titleize : _('Never')
      last_refresh_status << _(" - %{last_refresh_date} Ago") % {:last_refresh_date => last_refresh_date}
    end
    {
      :label  => _("Last Refresh Status"),
      :value  => [{:value => last_refresh_status},
                  {:value => record.last_refresh_error.try(:truncate, 120)}],
      :title  => record.last_refresh_error,
      :status => record.last_refresh_status,
      :stale  => refresh_time ? refresh_time.before?(2.days.ago) : true # checking if date is within last two days range.
    }
  end

  def refresh_date(record)
    last_refresh_date = record.last_refresh_date
    {:label => _("Last Refresh Date"), :value => last_refresh_date}
  end
end
