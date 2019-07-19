class ApplicationHelper::Button::ViewGHTAlways < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::XActiveTreeMixin

  def visible?
    reports_tree? || savedreports_tree?
  end
end
