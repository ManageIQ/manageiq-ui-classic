class ApplicationHelper::Button::ViewDashboard < ApplicationHelper::Button::Basic
  def disabled?
    @showtype == 'dashboard'
  end
end
