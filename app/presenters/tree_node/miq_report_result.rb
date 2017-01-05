module TreeNode
  class MiqReportResult < Node
    set_attribute(:icon) do
      case @object.status.downcase
      when 'error'
        'pficon pficon-error-circle-o'
      when 'finished'
        'pficon pficon-ok'
      when 'running'
        'pficon pficon-running'
      when 'queued'
        'fa fa-play-circle-o'
      else
        'product product-arrow-right'
      end
    end

    set_attributes(:title, :tooltip, :expand) do
      expand = nil
      if @object.last_run_on.nil? && %w(queued running).include?(@object.status.downcase)
        title   = _('Generating Report')
        tooltip = _('Generating Report for - %{report_name}') % {:report_name => @object.name}
      elsif @object.last_run_on.nil? && @object.status.downcase == 'error'
        title   = _('Error Generating Report')
        tooltip = _('Error Generating Report for %{report_name}') % {:report_name => @object.name}
        expand  = !!@options[:open_all]
      else
        title   = format_timezone(@object.last_run_on, Time.zone, 'gtl')
        tooltip = nil
      end
      [title, tooltip, expand]
    end
  end
end
