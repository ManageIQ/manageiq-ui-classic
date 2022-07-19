class ApplicationHelper::Button::IsoDatastoreNew < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    if no_ems_without_iso_datastores?
      @error_message = _('No Providers are available to create an ISO Datastore on')
    end
    @error_message.present?
  end

  private

  def no_ems_without_iso_datastores?
    ExtManagementSystem.supporting(:create_iso_datastore).none?
  end
end
