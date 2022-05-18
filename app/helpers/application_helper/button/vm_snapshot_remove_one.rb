class ApplicationHelper::Button::VmSnapshotRemoveOne < ApplicationHelper::Button::Basic
  needs :@record, :@active

  def disabled?
    # TODO: move ovirt's @active special case into supports mechanism.
    @error_message = @record.try(:remove_snapshot_denied_message, @active)
    @error_message ||= unless @record.supports?(:remove_snapshot)
                         @record.unsupported_reason(:remove_snapshot)
                       end
    @error_message.present?
  end
end
