class ApplicationHelper::Button::ViewSummary < ApplicationHelper::Button::Basic
  def disabled?
    @showtype != 'dashboard'
  end
end
