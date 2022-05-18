class ApplicationHelper::Button::VmSnapshotAdd < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = if !role_allows?(:feature => 'vm_snapshot_add')
                       _('Current user lacks permissions to create a new snapshot for this VM')
                     elsif !@record.supports?(:snapshot_create)
                       @record.unsupported_reason(:snapshot_create)
                     end
    @error_message.present?
  end
end
