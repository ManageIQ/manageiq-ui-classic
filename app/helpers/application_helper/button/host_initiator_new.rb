class ApplicationHelper::Button::HostInitiatorNew < ApplicationHelper::Button::Basic
  def calculate_properties
    super
    if disabled?
      self[:title] = _("No storage providers support creating host initiators.")
    end
  end

  # If we selected specific EMS disable create button if not supporting create action.
  # Else disable button if no active providers support create action
  def disabled?
    if @view_context.params["id"]
      current_ems = ExtManagementSystem.where(:id => @view_context.params["id"]).first
      !current_ems.class_by_ems("HostInitiator")&.supports?(:create)
    else
      ExtManagementSystem.none? do |ems|
        ems.class_by_ems("HostInitiator")&.supports?(:create)
      end
    end
  end
end
