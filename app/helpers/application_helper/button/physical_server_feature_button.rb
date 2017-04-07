class ApplicationHelper::Button::PhysicalServerFeatureButton < ApplicationHelper::Button::GenericFeatureButton

  def visible?
    true
  end

  def disabled?
    false
  end
end
