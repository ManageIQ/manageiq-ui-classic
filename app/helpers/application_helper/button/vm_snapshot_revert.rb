class ApplicationHelper::Button::VmSnapshotRevert < ApplicationHelper::Button::Basic
  needs :@record, :@active

  def visible?
    return false if @record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)
    super
  end

  def disabled?
    @error_message = @record.try(:revert_to_snapshot_denied_message, @active)
    @error_message ||= unless @record.supports_revert_to_snapshot?
                         @record.unsupported_reason(:revert_to_snapshot)
                       end
    @error_message.present?
  end
end
