class ApplicationHelper::Button::CatalogItemButtonReorder < ApplicationHelper::Button::CatalogItemButton
  needs :@record

  def visible?
    (@record.custom_button_sets.size + @record.custom_buttons.size).positive?
  end
end
