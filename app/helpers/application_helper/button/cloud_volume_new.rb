class ApplicationHelper::Button::CloudVolumeNew < ApplicationHelper::Button::ButtonNewDiscover
  def calculate_properties
    super
    if disabled?
      self[:title] = _("No cloud providers support creating cloud volumes.")
    end
  end

  def role_allows_feature?
    super && role_allows?(:feature => 'cloud_tenant_show_list')
  end

  # disable button if no active providers support create action
  def disabled?
    ExtManagementSystem.all.none? { |ems| CloudVolume.class_by_ems(ems).supports_create? }
  end
end
