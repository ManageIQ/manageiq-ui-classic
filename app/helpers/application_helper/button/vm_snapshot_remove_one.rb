class ApplicationHelper::Button::VmSnapshotRemoveOne < ApplicationHelper::Button::Basic
  needs :@record, :@active

  def disabled?
    @error_message = @record.try(:remove_snapshot_denied_message, @active)
    @error_message ||= unless @record.supports_remove_snapshot?
                         @record.unsupported_reason(:remove_snapshot)
                       end
    @error_message.present?
  end
end
