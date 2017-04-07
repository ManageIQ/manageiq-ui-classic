class ApplicationHelper::Button::FloatingIp < ApplicationHelper::Button::Basic
  def visible?
    @view_context.controller.class == FloatingIpController
  end
end
