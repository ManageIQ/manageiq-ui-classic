class ApplicationHelper::Button::ProviderUserSync < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    # If tenant mapping is not enabled, then the provider will have no
    # tenants being refreshed into the ems. This means no groups can
    # be created because groups require a tenant and role pair. If
    # no groups can be created, then any new users will have their
    # current_group attribute set to nil. Users cannot login if
    # they do not have a current group. Therefore user sync is
    # a noop if tenant mapping is not enabled.
    # Click2Cloud: Added telefonica cloudmanager condition
    (@record.class == ManageIQ::Providers::Openstack::CloudManager || @record.class == ManageIQ::Providers::Telefonica::CloudManager) && @record.tenant_mapping_enabled == true
  end
end
