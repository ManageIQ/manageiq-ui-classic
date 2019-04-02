class ApplicationHelper::Button::DbNew < ApplicationHelper::Button::ButtonNewDiscover
  MAX_DASHBOARD_COUNT = 10

  def disabled?
    if @widgetsets.length >= MAX_DASHBOARD_COUNT
      @error_message = _('Only %{dashboard_count} Dashboards are allowed for a group') %
                       {:dashboard_count => MAX_DASHBOARD_COUNT}
    end
    @error_message.present?
  end
end
