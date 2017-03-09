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
end
