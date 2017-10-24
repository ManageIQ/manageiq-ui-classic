class ApplicationHelper::Button::ProviderUserSync < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.class == ManageIQ::Providers::Openstack::CloudManager
  end
end
