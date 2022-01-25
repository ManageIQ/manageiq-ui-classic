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

  def chart_no_url(options)
    case ManageIQ::Reporting::Charting.backend
    when :c3 then content_tag(:div, '', :id => options[:id])
    end
  end

  # if it can then fix app/views/dashboard/_widget_chart.html.erb
  def chart_local(data, options)
    case ManageIQ::Reporting::Charting.backend
    when :c3 then c3chart_local(data, options.slice(:id))
    end
  end
end
