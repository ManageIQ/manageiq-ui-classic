class ApplicationHelper::Button::InstanceAttach < ApplicationHelper::Button::Basic
  def visible?
    # FIXME: feature for attach/detach is missing, testing class for now
    # Click2Cloud: Added telefonica cloudmanager condition
    @record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm) || @record.kind_of?(ManageIQ::Providers::Telefonica::CloudManager::Vm)
  end

  def disabled?
    if @record.cloud_tenant.nil? || @record.cloud_tenant.cloud_volumes.where(:status => 'available').count.zero?
      @error_message = _("There are no Cloud Volumes available to attach to this Instance.")
    end
    @error_message.present?
  end
end
