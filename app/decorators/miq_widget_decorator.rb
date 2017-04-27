class MiqWidgetDecorator < MiqDecorator
  def fonticon
    case content_type
    when 'chart'
      'fa fa-pie-chart'
    when 'menu'
      'fa fa-share-square-o'
    when 'report'
      'fa fa-file-text-o'
    when 'rss'
      'fa fa-rss'
    end
  end

  def secondary_icon
    case status.downcase
    when 'complete' then 'pficon pficon-ok'
    when 'queued'   then 'fa fa-pause'
    when 'running'  then 'pficon pficon-running'
    when 'error'    then 'pficon pficon-warning-triangle-o'
    end
  end
end
