class ApplicationHelper::Button::CloudObjectStoreContainerNew < ApplicationHelper::Button::Basic
  def calculate_properties
    super
    if disabled?
      self[:title] = _("No storage managers support creating cloud object store containers.")
    end
  end

  def disabled?
    CloudObjectStoreContainer.providers_supporting(:create).none?
  end
end
