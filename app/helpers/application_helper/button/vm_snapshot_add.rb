class ApplicationHelper::Button::VmSnapshotAdd < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = if records_and_role_allows? && !@active
                       _('Select the Active snapshot to create a new snapshot for this VM')
                     else
                       @record.unsupported_reason(:create_snapshot)
                     end
    @error_message.present?
  end

  private

  def records_and_role_allows?
    @record.supports_create_snapshot?
  end
end
