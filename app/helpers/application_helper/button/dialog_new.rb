class ApplicationHelper::Button::DialogNew < ApplicationHelper::Button::DialogAction
  include ApplicationHelper::Button::Mixins::SubListViewScreenMixin

  def visible?
    true
  end
end
