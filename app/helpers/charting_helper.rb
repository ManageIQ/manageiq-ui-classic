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

  def zoom_icon(zoom_url)
    # could be just url or something like
    # "javascript:miqAsyncAjax('/host/perf_chart_chooser/10000000000017?chart_idx=0')"
    zoom_url =~ /clear('\))?$/ ? 'fa fa-search-minus fa-lg' : 'fa fa-search-plus fa-lg'
  end
end
