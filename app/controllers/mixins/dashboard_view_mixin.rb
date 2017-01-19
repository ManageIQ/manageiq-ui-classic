module Mixins
  module DashboardViewMixin
    def dashboard_view
      if @sb[:summary_mode].present?
        @sb[:summary_mode] == 'dashboard'
      else
        (@settings.fetch_path(:views, :summary_mode) || "dashboard") == 'dashboard'
      end
    end
  end
end
