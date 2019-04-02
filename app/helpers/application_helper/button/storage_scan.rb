class ApplicationHelper::Button::StorageScan < ApplicationHelper::Button::GenericFeatureButtonWithDisable
  needs :@record

  def visible?
    true
  end
end
