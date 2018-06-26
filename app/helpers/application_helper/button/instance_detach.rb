class ApplicationHelper::Button::InstanceDetach < ApplicationHelper::Button::Basic
  def visible?
    # FIXME: feature for attach/detach is missing, testing class for now
    ManageIQ::Providers::Openstack::CloudManager::Vm === @record
  end

  def disabled?
    if @record.number_of(:cloud_volumes).zero?
      @error_message = _("This Instance has no attached Cloud Volumes.")
    end
    @error_message.present?
  end
end
