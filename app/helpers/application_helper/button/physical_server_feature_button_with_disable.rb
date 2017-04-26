class ApplicationHelper::Button::PhysicalServerFeatureButtonWithDisable < ApplicationHelper::Button::GenericFeatureButtonWithDisable
  def visible?
    true
  end

  def disabled?
    false
  end
end