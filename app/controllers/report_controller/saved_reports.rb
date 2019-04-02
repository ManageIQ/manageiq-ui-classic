module ReportController::SavedReports
  extend ActiveSupport::Concern

  def show_saved
    @sb[:last_saved_id] = params[:id] if params[:id] && params[:id] != "report"
    fetch_saved_report(@sb[:last_saved_id])
    if @report.blank? # if report was nil. reset active tree back to report tree, and keep active node report to be same
      self.x_active_tree = :reports_tree
    end
  end

  def show_saved_report
    @sb[:last_savedreports_id] = params[:id].to_s.split('-').last if params[:id] && params[:id] != "savedreports"
    fetch_saved_report(@sb[:last_savedreports_id])
  end

  def fetch_saved_report(id)
    rr = MiqReportResult.for_user(current_user).find(id.split('-').last)
    if rr.nil? # Saved report no longer exists
      @report = nil
      return
    end

    @right_cell_text ||= _("Saved Report \"%{name}\"") %
                         {:name => "#{rr.name} - #{format_timezone(rr.created_on, Time.zone, "gt")}"}

    unless report_admin_user? || current_user.miq_group_ids.include?(rr.miq_group_id)
      add_flash(_("Report is not authorized for the logged in user"), :error)
      get_all_reps(@sb[:miq_report_id].to_s)
      return
    end

    @report_result_id = session[:report_result_id] = rr.id
    session[:report_result_runtime] = rr.last_run_on

    return unless rr.status.downcase == "complete"

    session[:rpt_task_id] = nil

    unless rr.valid_report_column?
      add_flash(_("Saved Report \"%{time}\" not found, Schedule may have failed") %
                {:time => format_timezone(rr.created_on, Time.zone, "gtl")},
                :error)
      get_all_reps(rr.miq_report_id.to_s)
      if x_active_tree == :savedreports_tree
        self.x_node = "xx-#{rr.miq_report_id}"
      else
        @sb[:rpt_menu].each_with_index do |lvl1, i|
          next unless lvl1[0] == @sb[:grp_title]
          lvl1[1].each_with_index do |lvl2, k|
            x_node_set("xx-#{i}_xx-#{i}-#{k}_rep-#{rr.miq_report_id}", :reports_tree) if lvl2[0].downcase == "custom"
          end
        end
      end
      return
    end

    unless rr.contains_records?
      add_flash(_("No records found for this report"), :warning)
      return
    end

    @html = report_first_page(rr)
    if params[:type]
      @render_chart = false

      @html = if %w(tabular hybrid).include?(params[:type])
                report_build_html_table(
                  @report,
                  rr.html_rows(:page     => @sb[:pages][:current],
                               :per_page => @sb[:pages][:perpage]).join
                )
              end
      @ght_type = params[:type]
    else
      @ght_type = @report.graph.blank? ? 'tabular' : 'hybrid'
    end
    @render_chart = %w(graph hybrid).include?(@ght_type)

    @report.extras ||= {}
    @report.extras[:to_html] ||= @html
  end

  # Delete all selected or single displayed report(s)
  def saved_report_delete
    assert_privileges("saved_report_delete")
    savedreports = find_checked_items
    if savedreports.blank?
      report_result = x_node.split('_').last
      savedreport = report_result.split('-').last
      savedreports = Array.wrap(savedreport)
    end

    if savedreports.empty? && params[:id].present? && !MiqReportResult.for_user(current_user).exists?(params[:id].to_i)
      # saved report is being viewed in report accordion
      add_flash(_("Saved Report no longer exists"), :error)
    else
      savedreports.push(params[:id]) if savedreports.blank?
      @report = nil
      r = MiqReportResult.for_user(current_user).find(savedreports[0])
      @sb[:miq_report_id] = r.miq_report_id
      process_saved_reports(savedreports, "destroy") unless savedreports.empty?
      add_flash(_("The selected Saved Report was deleted")) if @flash_array.nil?
      @report_deleted = true
    end
    self.x_node = "xx-#{@sb[:miq_report_id]}" if x_active_tree == :savedreports_tree && x_node.split('-').first == "rr"
    replace_right_cell(:replace_trees => %i(reports savedreports))
  end

  # get all saved reports for list view
  def get_all_saved_reports
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    #   @embedded = true
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end

    @sortcol = session["#{x_active_tree}_sortcol".to_sym].nil? ? 0 : session["#{x_active_tree}_sortcol".to_sym].to_i
    @sortdir = session["#{x_active_tree}_sortdir".to_sym].nil? ? "DESC" : session["#{x_active_tree}_sortdir".to_sym]
    @no_checkboxes = !role_allows?(:feature => "miq_report_saved_reports_admin", :any => true)

    # show all saved reports
    @view, @pages = get_view(MiqReportResult, :association => "all",
                                              :named_scope => :with_current_user_groups_and_report)

    # build_savedreports_tree
    @sb[:saved_reports] = nil
    @right_cell_div     = "savedreports_list"
    @right_cell_text    = _("All Saved Reports")

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session["#{x_active_tree}_sortcol".to_sym] = @sortcol
    session["#{x_active_tree}_sortdir".to_sym] = @sortdir
  end

  private

  # Build the main Saved Reports tree
  def build_savedreports_tree
    TreeBuilderReportSavedReports.new('savedreports_tree', 'savedreports', @sb)
  end
end
