class ApplicationHelper::Button::ViewGHT < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::XActiveTreeMixin

  def visible?
    reports_tree? || savedreports_tree? ? proper_type? : true
  end

  private

  def proper_type?
    !%w[tabular data].index(@ght_type) || @report.try(:graph).present? || @render_chart
  end
end
