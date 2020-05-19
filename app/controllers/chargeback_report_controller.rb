class ChargebackReportController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::SavedReportPaging
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def self.table_name
    @table_name ||= "miq_report_result"
  end

  def self.model
    MiqReportResult
  end

  def show

  end

  def title
    @title = _("Chargeback Reports")
  end

  private ############################

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
        {:title => _("Reports"), :url => controller_url},
      ],
    }
  end

  menu_section :chargeback
end
