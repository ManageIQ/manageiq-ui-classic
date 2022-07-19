class ApplicationHelper::Button::EmsNetwork < ApplicationHelper::Button::Basic
  def visible?
    # Nuage is only provider that supports adding NetworkProvider manually
    # therefore we hide drop-down option completely unless Nuage is listed
    # in config/permissions.yaml.
    return Vmdb::PermissionStores.instance.supported_ems_type?('nuage_network') unless @record # allow add new network manager

    @record.supports?(:update) # allow edit of existing manager
  end
end
