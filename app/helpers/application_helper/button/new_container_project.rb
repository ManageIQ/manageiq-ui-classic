class ApplicationHelper::Button::NewContainerProject < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    super || ManageIQ::Providers::Openshift::ContainerManager.count == 0
  end
end
