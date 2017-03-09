class ApplicationHelper::Button::ZoneCollectLogs < ApplicationHelper::Button::ZoneLogDepotEdit
  needs :@record

  def disabled?
    @error_message = if !@record.any_started_miq_servers?
                       _('Cannot collect current logs unless there are started %{servers} in the Zone') %
                         {:servers => ui_lookup(:tables => 'miq_servers')}
                     elsif !@record.log_file_depot
                       _('This Zone do not have Log Depot settings configured, collection not allowed')
                     elsif @record.log_collection_active_recently?
                       _('Log collection is already in progress for one or more %{servers} in this Zone') %
                         {:servers => ui_lookup(:tables => 'miq_servers')}
                     end
    @error_message.present?
  end
end
