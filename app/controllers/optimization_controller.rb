class OptimizationController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def self.model
    nil
  end

  def title
    @title || _("Optimization")
  end

  def self.session_key_prefix
    'optimization'
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _('Overview')},
        bc_optimization,
        bc_report,
      ].compact,
    }
  end

  # show optimization when in saved reports or report results
  def bc_optimization
    return nil if params[:id].blank? && params[:action] == 'show_list'

    {:title => _("Optimization"), :url => url_for_only_path(:action => 'show_list', :id => nil)}
  end

  # show report when in report results
  def bc_report
    return nil if @report.nil?

    {:title => @report.name, :url => url_for_only_path(:action => 'show_list', :id => @report.id)}
  end

  def index
    redirect_to(:action => 'show_list')
  end

  def show_list
    if params[:id].blank?
      show_hardcoded_reports
    else
      show_saved_reports
    end
  end

  def show
    @record = find_record_with_rbac(MiqReportResult, params[:id])
    @report = find_record_with_rbac(MiqReport, params[:report_id] || @record.miq_report_id)
    @title = @record.name
  end

  def queue_report
    assert_privileges("miq_report_run")

    report = MiqReport.for_user(current_user).find(params[:id])
    result_id = report.queue_generate_table(:userid => session[:userid])

    render :json => {
      :report_id => report.id,
      :result_id => result_id,
      :flash     => _("Report has been successfully queued to run"),
    }
  end

  def show_saved_reports
    @record = find_record_with_rbac(MiqReport, params[:id])
    @title = @record.name
    @gtl_url = 'show_list' # breadcrumbs
    @center_toolbar = 'optimizations'

    @table = gtl_saved(@record)
  end

  def show_hardcoded_reports
    @record = nil
    @center_toolbar = 'optimizations'

    @table = gtl_hardcoded
  end

  def gtl_hardcoded
    columns = [
      # :id
      [:name,        _("Report name")],
      [:last_run_on, _("Last Run at")],
      [:count,       _("Report runs")],
      [:action,      _("Action")],
      # :url
      # :queue_url
      # :klass
    ]

    rows = hardcoded_reports.map do |report|
      {
        :id          => report.id,
        :name        => report.name,
        :last_run_on => report.miq_report_results.order('last_run_on DESC').first.try(:last_run_on),
        :count       => report.miq_report_results.count,
        :action      => nil, # reserved for JS
        :url         => url_for_only_path(:action => 'show_list', :id => report.id),
        :queue_url   => url_for_only_path(:action => 'queue_report', :id => report.id),
        :klass       => 'MiqReport',
      }
    end

    [columns, rows]
  end

  def gtl_saved(report)
    columns = [
      # :id
      # :report_id
      [:name,        _("Report")],
      [:last_run_on, _("Last Run at")],
      [:userid,      _("Username")],
      # :url
      # :klass
    ]

    rows = report.miq_report_results.order('last_run_on DESC').map do |saved|
      {
        :id          => saved.id,
        :report_id   => report.id,
        :name        => saved.name,
        :last_run_on => saved.last_run_on,
        :userid      => saved.userid,
        :url         => url_for_only_path(:action => 'show', :id => saved.id, :report_id => report.id),
        :klass       => 'MiqReportResult',
      }
    end

    [columns, rows]
  end

  def self.hardcoded_reports
    [
      # 400_Operations- Virtual Machines/045_VMs_ Offline VMs with Snapshot.yaml
      'Offline VMs with Snapshot',
      # 425_VM Sprawl - Candidates/052_VMs with Volume Free Space -= 75%.yaml
      'VMs with Volume Free Space >= 75%',
      # 650_Performance by Asset Type - Virtual Machines/160_Top CPU Consumers weekly.yaml
      'Top CPU Consumers (weekly)',
      # 650_Performance by Asset Type - Virtual Machines/170_Top Memory Consumers weekly.yaml
      'Top Memory Consumers (weekly)',
      # 770_Trending - Hosts/120_Host CPU Trends last week.yaml
      'Host CPU Trends (last week)',
      # 770_Trending - Hosts/140_Host Memory Trends last week.yaml
      'Host Memory Trends (last week)',
    ]
  end

  def hardcoded_reports
    MiqReport.where(:menu_name => self.class.hardcoded_reports).order('name')
  end

  def layout_uses_listnav?
    false
  end
  helper_method :layout_uses_listnav?

  def taskbar_in_header?
    @center_toolbar.present?
  end
  helper_method :taskbar_in_header?

  def display_back_button?
    false
  end
  helper_method :display_back_button?
end
