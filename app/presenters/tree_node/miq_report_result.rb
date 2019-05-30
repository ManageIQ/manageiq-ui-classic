module TreeNode
  class MiqReportResult < Node
    set_attributes(:text, :tooltip) do
      if @object.last_run_on.nil? && %w[queued running].include?(@object.status.downcase)
        text    = _('Generating Report')
        tooltip = _('Generating Report for - %{report_name}') % {:report_name => @object.name}
      elsif @object.last_run_on.nil? && @object.status.downcase == 'error'
        text    = _('Error Generating Report')
        tooltip = _('Error Generating Report for %{report_name}') % {:report_name => @object.name}
      else
        text    = format_timezone(@object.last_run_on, Time.zone, 'gtl')
        tooltip = nil
      end
      [text, tooltip]
    end
  end
end
