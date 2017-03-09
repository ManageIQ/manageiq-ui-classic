class MiqReportResultDecorator < MiqDecorator
  def fonticon
    case status.downcase
    when 'error'
      'pficon pficon-error-circle-o'
    when 'finished'
      'pficon pficon-ok'
    when 'running'
      'pficon pficon-running'
    when 'queued'
      'fa fa-play-circle-o'
    else
      'fa fa-arrow-right'
    end
  end
end
