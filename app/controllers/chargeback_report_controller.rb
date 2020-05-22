class ChargebackReportController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::SavedReportPaging
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def self.model
    MiqReportResult
  end

  def show_list
    process_show_list({:named_scope => :with_saved_chargeback_reports, :no_checkboxes => true})
    @title = _("Chargeback Saved Reports")
  end

  def show
    @center_toolbar = 'chargeback_report'
    fetch_saved_report(params[:id])
  end

  private ############################

  def self.session_key_prefix
    'chargeback_report'
  end

  def fetch_saved_report(id)
    rr = MiqReportResult.for_user(current_user).find_by(:id => id)
    if rr.nil? # Saved report no longer exists
      @report = nil
      add_flash(_("Error: Report no longer exists in the database"), :error)
      return
    end
    @title ||= _("Saved Chargeback Report [%{name}]") % {:name => rr.name}
    if !current_user.miq_group_ids.include?(rr.miq_group_id) && !report_admin_user?
      add_flash(_("Report is not authorized for the logged in user"), :error)
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
          return MiqReport.find(rr.miq_report_id)
        end
      end
    end
  end

  def saved_report_paging?
    @sb[:pages] && @html
  end
  helper_method :saved_report_paging?

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
