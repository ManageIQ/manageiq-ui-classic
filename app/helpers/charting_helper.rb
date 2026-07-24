module ChartingHelper
  def chart_remote(a_controller, options)
    case ManageIQ::Reporting::Charting.backend
    when :c3
      c3chart_remote(
        url_for_only_path(
          :controller => a_controller,
          :action     => options[:action] || 'render_chart'
        ),
        options.slice(:id, :zoomed)
      )
    end
  end

end
