class ApplicationHelper::Button::VmSnapshotRevert < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    return false if @record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)
    super
  end

  def disabled?
    @error_message = unless @record.supports_revert_to_snapshot?
                       @record.unsupported_reason(:revert_to_snapshot)
                     end
    @error_message.present?
  end
end
