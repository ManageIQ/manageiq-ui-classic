class ApplicationHelper::Button::MassTransformVmButton < ApplicationHelper::Button::Basic
  def visible?
    store = Vmdb::PermissionStores.instance
    store.can?('vm_transform_mass')
  end

  def disabled?
    @error_message = _('No suitable target infra provider exists') unless destination_exists?
    @error_message.present?
  end

  def destination_exists?
    # Is there a provider that supports import?
    ManageIQ::Providers::Redhat::InfraManager.all.detect(&:supports_vm_import?).present?
  end
end
