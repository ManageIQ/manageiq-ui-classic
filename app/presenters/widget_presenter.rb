class WidgetPresenter
  include ApplicationHelper
  include ActionView::Helpers::UrlHelper

  def initialize(view, controller, widget)
    @view = view
    @controller = controller
    @widget = widget
    @sb = controller.instance_eval { @sb }
  end

  extend Forwardable
  def_delegators(:@controller, :current_user, :url_for_only_path, :initiate_wait_for_task,
                 :session_init, :session_reset, :start_url_for_user)

  attr_reader :widget

  def render_partial
    @controller.render_to_string(:template => 'dashboard/_widget', :handler => [:haml],
                                 :layout => false, :locals => {:presenter => self}).html_safe
  end

  def widget_buttons
    buttons = []
    if role_allows?(:feature => "dashboard_add")
      unless @sb[:dashboards][@sb[:active_db]][:locked]
        buttons.push(:id         => "w_#{@widget.id}_close",
                     :title      => _("Remove from Dashboard"),
                     :name       => _("Remove Widget"),
                     :confirm    => _("Are you sure you want to remove '%{title}'" \
                                      "from the Dashboard?") % {:title => @widget.title},
                     :dataRemote => true,
                     :sparkleOn  => true,
                     :href       => '/dashboard/widget_close?widget=' + @widget.id.to_s,
                     :fonticon   => 'fa fa-times fa-fw',
                     :dataMethod => 'post')
      end
      minimized = @sb[:dashboards][@sb[:active_db]][:minimized].include?(@widget.id)
      title = minimized ? _("Maximize") : _("Minimize")
      buttons.push(:id         => "w_#{@widget.id}_minmax",
                   :title      => title,
                   :name       => title,
                   :confirm    => false,
                   :dataRemote => true,
                   :href       => '/dashboard/widget_toggle_minmax?widget=' + @widget.id.to_s,
                   :fonticon   => "fa fa-caret-square-o-#{minimized ? 'down' : 'up'} fa-fw",
                   :dataMethod => 'post')
    end

    if @widget.contents_for_user(current_user).present? && %w[report chart].include?(@widget.content_type)
      title = if @widget.content_type == "chart"
                _("Open the chart and full report in a new window")
              else
                _("Open the full report in a new window")
              end
      confirm = if @widget.content_type == "chart"
                  _("This will show the chart and the entire report (all rows) in your browser. Do you want to proceed?")
                else
                  _("This will show the entire report (all rows) in your browser. Do you want to proceed?")
                end
      buttons.push(:id       => "w_#{@widget.id}_fullscreen",
                   :title    => title,
                   :name     => _("Full Screen"),
                   :confirm  => confirm,
                   :href     => "/dashboard/report_only?rr_id=#{@widget.contents_for_user(current_user).miq_report_result_id}&type=#{@widget.content_type == "chart" ? 'hybrid' : 'tabular'}",
                   :fonticon => 'fa fa-arrows-alt fa-fw',
                   :target   => "_blank")
      buttons.push(:id       => "w_#{@widget.id}_pdf",
                   :title    => _("Print the full report (all rows) or export it as a PDF file"),
                   :name     => _("Print or export to PDF"),
                   :href     => '/dashboard/widget_to_pdf?rr_id=' + @widget.contents_for_user(current_user).miq_report_result_id.to_s,
                   :target   => '_blank',
                   :fonticon => 'pficon pficon-print fa-fw')
    end

    if @widget.content_type == 'chart'
      buttons.push(:id         => "w_#{@widget.id}_zoom",
                   :title      => _("Zoom in on this chart"),
                   :name       => _("Zoom in"),
                   :href       => '/dashboard/widget_zoom?widget=' + @widget.id.to_s,
                   :fonticon   => 'fa fa-plus fa-fw',
                   :dataRemote => true,
                   :sparkleOn  => true,
                   :dataMethod => 'post')
    end
    if @widget.content_type != 'menu'
      buttons.push(:id        => "w_#{@widget.id}_refresh",
                   :title     => _("Refresh this Widget"),
                   :name      => _("Refresh"),
                   :fonticon  => 'fa fa-refresh fa-fw',
                   :href      => 'javascript:;',
                   :refresh   => true,
                   :sparkleOn => true)
    end

    buttons.to_json
  end

  def self.chart_data
    @chart_data ||= []
  end

  def self.reset_data
    @chart_data = []
  end
end
