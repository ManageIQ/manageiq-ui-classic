class ApplicationHelper::Button::MiqWidgetSetCopy < ApplicationHelper::Button::Basic
  def visible?
    User.current_user.super_admin_user?
  end
end
