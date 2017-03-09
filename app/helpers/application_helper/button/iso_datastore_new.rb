class ApplicationHelper::Button::IsoDatastoreNew < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    if no_ems_without_iso_datastores?
      @error_message = _('No %{providers} are available to create an ISO Datastore on') %
                       {:providers => ui_lookup(:tables => 'ext_management_system')}
    end
    @error_message.present?
  end

  private

  def no_ems_without_iso_datastores?
    !ManageIQ::Providers::Redhat::InfraManager.any_without_iso_datastores?
  end
end
