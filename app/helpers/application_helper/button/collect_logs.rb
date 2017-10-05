class ApplicationHelper::Button::CollectLogs < ApplicationHelper::Button::LogDepotEdit
  include ApplicationHelper::Button::Mixins::ButtonPromptMixin
  needs :@record

  def disabled?
    @error_message = if !@record.started?
                       _('Cannot collect current logs unless the Server is started')
                     elsif @record.log_collection_active_recently?
                       _('Log collection is already in progress for this Server')
                     elsif !@record.log_file_depot
                       _('Log collection requires the Log Depot settings to be configured')
                     end
    @error_message.present?
  end
end
