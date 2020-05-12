class ChargebackReportController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::SavedReportPaging
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def self.table_name
    @table_name ||= "chargeback_report"
  end

  def x_show
    @explorer = true
  end

  def tree_select
    self.x_active_tree = params[:tree] if params[:tree]
    self.x_node = params[:id]
    get_node_info(x_node)
    replace_right_cell
  end

  def explorer
    @breadcrumbs = []
    @explorer    = true
    build_accordions_and_trees

    @right_cell_text = _("All Saved Chargeback Reports")
    render :layout => "application" unless request.xml_http_request?
  end

  def title
    @title = _("Chargeback Reports")
  end

  private ############################

  def features
    [
      {
        :role  => "chargeback_reports",
        :name  => :cb_reports,
        :title => _("Reports")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  # Build a Chargeback Reports explorer tree
  def cb_rpts_build_tree
    TreeBuilderChargebackReports.new("cb_reports_tree", @sb)
  end

  def cb_rpts_show_saved_report
    @sb[:last_savedreports_id] = parse_nodetype_and_id(params[:id]).last if params[:id] && params[:id] != "cb_reports_accord"
    cb_rpts_fetch_saved_report(@sb[:last_savedreports_id])
    @sb[:parent_reports] = nil if @report.blank?
  end

  def cb_rpts_fetch_saved_report(id)
    rr = MiqReportResult.for_user(current_user).find(id.to_s.split('-').last)
    if rr.nil? # Saved report no longer exists
      @report = nil
      return
    end
    @right_cell_text ||= _("Saved Chargeback Report [%{name}]") % {:name => rr.name}
    if !current_user.miq_group_ids.include?(rr.miq_group_id) && !report_admin_user?
      add_flash(_("Report is not authorized for the logged in user"), :error)
      @saved_reports = cb_rpts_get_all_reps(id.split('-')[1])
      return
    else
      @report_result_id = session[:report_result_id] = rr.id
      session[:report_result_runtime] = rr.last_run_on
      if rr.status.downcase == "complete"
        session[:rpt_task_id] = nil
        if rr.valid_report_column?
          if rr.contains_records?
            @html = report_first_page(rr) # Get the first page of the results
            if @report.graph.present?
              @render_chart = true
              @ght_type = "hybrid"
            else
              @ght_type = "tabular"
            end
            @report.extras ||= {} # Create extras hash
            @report.extras[:to_html] ||= @html # Save the html report
          else
            add_flash(_("No records found for this report"), :warning)
          end
        else
          @saved_reports = cb_rpts_get_all_reps(rr.miq_report_id.to_s)
          rep = MiqReport.find(rr.miq_report_id)
          if x_active_tree == :cb_reports_tree
            self.x_node = "reports-#{rep.id}"
          end
          return
        end
      end
    end
  end

  def get_node_info(node, show_list = true)
    @show_list = show_list
    node = valid_active_node(node)
    @nodetype = node.split("-")[0]
    nodes = x_node.split('_')
    nodes_len = nodes.length

    # On the root node
    if x_node == "root"
      cb_rpt_build_folder_nodes
      @right_cell_div = "reports_list_div"
      @right_cell_text = _("All Saved Chargeback Reports")
    elsif nodes_len == 2
      # On a saved report node
      cb_rpts_show_saved_report
      if @report
        s = MiqReportResult.for_user(current_user).find(nodes.last.split('-').last)

        @right_cell_div = "reports_list_div"
        @right_cell_text = _("Saved Chargeback Report \"%{last_run_on}\"") % {:last_run_on => format_timezone(s.last_run_on, Time.zone, "gtl")}
      else
        add_flash(_("Selected Saved Chargeback Report no longer exists"), :warning)
        self.x_node = nodes[0..1].join("_")
        cb_rpts_build_tree # Rebuild tree
      end
    # On a saved reports parent node
    else
      # saved reports under report node on saved report accordion
      @saved_reports = cb_rpts_get_all_reps(nodes[0].split('-')[1])
      if @saved_reports.present?
        @sb[:sel_saved_rep_id] = nodes[1]
        @right_cell_div = "reports_list_div"
        miq_report = MiqReport.for_user(current_user).find(@sb[:miq_report_id])
        @right_cell_text = _("Saved Chargeback Reports \"%{report_name}\"") % {:report_name => miq_report.name}
        @sb[:parent_reports] = nil if @sb[:saved_reports].present? # setting it to nil so saved reports can be displayed, unless all saved reports were deleted
      else
        add_flash(_("Selected Chargeback Report no longer exists"), :warning)
        self.x_node = nodes[0]
        @saved_reports = nil
        cb_rpts_build_tree # Rebuild tree
      end
    end
    {:view => @view, :pages => @pages}
  end

  def cb_rpt_build_folder_nodes
    @parent_reports = {}

    MiqReportResult.with_saved_chargeback_reports.select_distinct_results.each_with_index do |sr, sr_idx|
      @parent_reports[sr.miq_report.name] = "#{sr.miq_report_id}-#{sr_idx}"
    end
  end

  def cb_rpts_get_all_reps(nodeid)
    return [] if nodeid.blank?

    @sb[:miq_report_id] = nodeid
    miq_report = MiqReport.for_user(current_user).find(@sb[:miq_report_id])
    saved_reports = miq_report.miq_report_results.with_current_user_groups
                              .select("id, miq_report_id, name, last_run_on, report_source")
                              .order(:last_run_on => :desc)

    @sb[:tree_typ] = "reports"
    @right_cell_text = _("Report \"%{report_name}\"") % {:report_name => miq_report.name}
    saved_reports
  end


  def replace_right_cell(options = {})
    @explorer = true
    c_tb = build_toolbar(center_toolbar_filename)

    # Build a presenter to render the JS
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    # FIXME
    #  if params[:action].ends_with?("_delete")
    #    page << "miqTreeActivateNodeSilently('#{x_active_tree.to_s}', '<%= x_node %>');"
    #  end
    # presenter[:select_node] = x_node if params[:action].ends_with?("_delete")
    presenter[:osf_node] = x_node


    if c_tb.present?
      presenter.reload_toolbars(:center => c_tb)
      presenter.show(:toolbar)
    else
      presenter.hide(:toolbar)
    end
    presenter.update(:main_div, r[:partial => 'reports_list'])
    if @html
      presenter.update(:paging_div, r[:partial => 'layouts/saved_report_paging_bar',
                                      :locals  => @sb[:pages]])
      presenter.show(:paging_div)
    else
      presenter.hide(:paging_div)
    end

    presenter.hide(:form_buttons_div)
    if x_active_tree == :cb_reports_tree && !@report
      presenter.hide(:toolbar).remove_paging
    else
      presenter.show(:paging_div)
    end

    presenter[:record_id] = determine_record_id_for_presenter

    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'

    presenter[:right_cell_text]     = @right_cell_text
    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  def get_session_data
    super
    @current_page = session[:chargeback_report_current_page]
  end

  def set_session_data
    super
    session[:chargeback_report_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Overview")},
        {:title => _("Chargeback")},
      ],
    }
  end

  menu_section :chargeback
end
