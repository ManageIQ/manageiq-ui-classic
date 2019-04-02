class ApplicationHelper::Button::CloudObjectStoreContainerNew < ApplicationHelper::Button::Basic
  def calculate_properties
    super
    if disabled?
      self[:title] = _("No storage managers support creating cloud object store containers.")
    end
  end

  def disabled?
    !ExtManagementSystem.any? { |ems| ems.supports?(:cloud_object_store_container_create) }
  end
end
