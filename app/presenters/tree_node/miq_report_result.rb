module TreeNode
  class MiqReportResult < Node
    set_attribute(:icon) { @object.decorate.fonticon }

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
