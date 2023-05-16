class ApplicationHelper::Button::HostRegisterNodes < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.instance_of?(ManageIQ::Providers::Openstack::InfraManager)
  end
end
