class ApplicationHelper::Button::CollectLogs < ApplicationHelper::Button::DiagnosticsLogs
  needs :@record

  def disabled?
    @error_message = if !@record.started?
                       _('Cannot collect current logs unless the %{server} is started') %
                         {:server => ui_lookup(:table => 'miq_server')}
                     elsif @record.log_collection_active_recently?
                       _('Log collection is already in progress for this %{server}') %
                         {:server => ui_lookup(:table => 'miq_server')}
                     elsif !@record.log_file_depot
                       _('Log collection requires the Log Depot settings to be configured')
                     end
    @error_message.present?
  end
end
