module Mixins
  module DashboardViewMixin
    def dashboard_view
      if @sb[:summary_mode].present?
        @sb[:summary_mode] == 'dashboard'
      else
        (@settings.fetch_path(:views, :summary_mode) || "dashboard") == 'dashboard'
      end
    end

    def show_dashboard
      @showtype = "dashboard"
      @lastaction = "show_dashboard"
      drop_breadcrumb(:name => @record.name + _(" (Dashboard)"), :url => show_link(@record))
      @sb[:summary_mode] = 'dashboard' unless @sb[:summary_mode] == 'dashboard'
      render :action => "show_dashboard"
    end
  end
end
