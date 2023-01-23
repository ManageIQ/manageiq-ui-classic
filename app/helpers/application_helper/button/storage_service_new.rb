class ApplicationHelper::Button::StorageServiceNew < ApplicationHelper::Button::Basic
  def calculate_properties
    super
    if disabled?
      self[:title] = _("No storage providers support creating storage services.")
    end
  end

  # If we selected specific EMS disable create button if not supporting create action.
  # Else disable button if no active providers support create action
  def disabled?
    if @view_context.params["id"]
      current_ems = ExtManagementSystem.find(@view_context.params["id"])
      !current_ems.class_by_ems("StorageService")&.supports?(:create)
    else
      StorageService.providers_supporting(:create).none?
    end
  end
end
