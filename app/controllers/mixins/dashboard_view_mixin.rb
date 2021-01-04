module Mixins
  module DashboardViewMixin
    def dashboard_view
      if @sb and @sb[:summary_mode].present?
        @sb[:summary_mode] == 'dashboard'
      else
        mode = (@settings || {}).fetch_path(:views, :summary_mode)
        mode.nil? || mode == "dashboard"
      end
    end

    def show_dashboard
      @showtype = "dashboard"
      @lastaction = "show_dashboard"
      drop_breadcrumb(:name => @record.name + _(" (Dashboard)"), :url => show_link(@record))
      @sb[:summary_mode] = 'dashboard' unless @sb[:summary_mode] == 'dashboard'
      add_flash(_("Warning: This provider is paused, no data is currently collected from it."), :warning) if @record.kind_of?(ExtManagementSystem) && !@record.try(:enabled)
      render :action => "show_dashboard"
    end
  end
end
