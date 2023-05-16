class ApplicationHelper::Button::EmsInfraScale < ApplicationHelper::Button::Basic
  def visible?
    @record.instance_of?(ManageIQ::Providers::Openstack::InfraManager) && @record.orchestration_stacks.count != 0 && @record.hosts.count != 0
  end
end
