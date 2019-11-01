module ApplicationController::ReportDownloads
  extend ActiveSupport::Concern

  # Send the current report in text format
  def render_txt
    report = report_for_rendering
    filename = filename_timestamp(report.title)
    disable_client_cache
    send_data(report.to_text, :filename => "#{filename}.txt")
  end

  # Send the current report in csv format
  def render_csv
    report = report_for_rendering
    filename = filename_timestamp(@report.title)
    disable_client_cache
    send_data(report.to_csv, :filename => "#{filename}.csv")
  end

  def render_pdf_internal(report)
    userid = "#{session[:userid]}|#{request.session_options[:id]}|adhoc"
    result = report.build_create_results(:userid => userid)

    # Use result from paging, if present
    result ||= MiqReportResult.for_user(current_user).find(@sb[:pages][:rr_id]) if @sb[:pages]
    # Use report_result_id in session, if present
    result ||= MiqReportResult.for_user(current_user).find(session[:report_result_id]) if session[:report_result_id]

    disable_client_cache

    @options = { # used by the layouts/print
      :page_layout => 'landscape',
      :page_size   => report.page_size || 'a4',
      :run_date    => format_timezone(report.report_run_time, result.user_timezone, "gtl"),
      :title       => result.name
    }

    render(
      :template => '/layouts/print/report',
      :layout   => '/layouts/print',
      :locals   => {
        :report => report,
        :data   => result.html_rows.join
      }
    )
  end

  # Send the current report in pdf format
  def render_pdf
    render_pdf_internal(report_for_rendering)
  end

  # Show the current widget report in pdf format
  def widget_to_pdf
    session[:report_result_id] = params[:rr_id]
    render_pdf_internal(report_from_report_results(params[:rr_id]))
  end

  def render_report_data_init(render_type)
    if render_type
      @sb[:render_type] = render_type
      rr = MiqReportResult.for_user(current_user).find(session[:report_result_id]) # Get report task id from the session
      task_id = rr.async_generate_result(@sb[:render_type], :userid     => session[:userid],
                                                            :session_id => request.session_options[:id])
      initiate_wait_for_task(:task_id => task_id)
    end
  end

  def render_report_data_continue(task_id)
    miq_task = MiqTask.find(task_id)
    if !miq_task.results_ready?
      add_flash(_("Report generation returned: Status [%{status}] Message [%{message}]") % {:status => miq_task.status, :message => miq_task.message}, :error)
      javascript_flash(:spinner_off => true)
    else
      @sb[:render_rr_id] = miq_task.miq_report_result.id
      if @sb[:render_type] == :pdf
        javascript_open_window(url_for_only_path(:action => "send_report_data"))
      else
        render :update do |page|
          page << javascript_prologue
          page << "miqSparkle(false);"
          page << "DoNav('#{url_for_only_path(:action => "send_report_data")}');"
        end
      end
    end
  end

  # Render report in csv/txt/pdf format asynchronously
  def render_report_data
    render_type = RENDER_TYPES[params[:render_type]]
    assert_privileges("render_report_#{render_type}")

    if params[:task_id]
      # We are waiting for a task to finish.
      render_report_data_continue(params[:task_id])
    else
      # First time thru, kick off the report generate task.
      render_report_data_init(render_type)
    end
  end
  alias_method :render_report_txt, :render_report_data
  alias_method :render_report_csv, :render_report_data
  alias_method :render_report_pdf, :render_report_data

  # Send rendered report data
  def send_report_data
    return unless @sb[:render_rr_id]

    disable_client_cache
    result = MiqReportResult.find(@sb[:render_rr_id])
    report = result.report

    ## THIS IS STRANGE
    # We need the last_run_on time from the original result
    last_run_on = MiqReportResult.select(:last_run_on).find(session[:report_result_id]).last_run_on

    if @sb[:render_type] == :pdf
      @options = { # needed by the /layouts/print
        :page_layout => 'landscape',
        :page_size   => report.page_size || 'a4',
        :run_date    => format_timezone(last_run_on, result.user_timezone, "gtl"),
        :title       => result.name
      }
      render(
        :template => '/layouts/print/report',
        :layout   => '/layouts/print',
        :locals   => {
          :report => report,
          :data   => result.html_rows.join
        }
      )
    else
      filename = filename_timestamp(result.report.title, 'export_filename')
      send_data(result.get_generated_result(@sb[:render_type]),
                :filename => "#{filename}.#{@sb[:render_type]}",
                :type     => "application/#{@sb[:render_type]}")
    end

    result.destroy
  end

  # Download currently displayed view
  def download_data
    @view = session[:view].dup if session[:view] # Copy session view, if it exists
    options = session[:paged_view_search_options].merge(:page => nil, :per_page => nil) # Get all pages
    @view.table, _attrs = @view.paged_view_search(options) # Get the records

    @view.title = _(@view.title.pluralize)
    @view.headers.map! { |header| _(header) }

    @filename = filename_timestamp(@view.title)
    case params[:download_type]
    when "pdf"
      download_pdf(@view)
    when "text"
      download_txt(@view)
    when "csv"
      download_csv(@view)
    end
  end

  private

  RENDER_TYPES = {'txt' => :txt, 'csv' => :csv, 'pdf' => :pdf}.freeze

  def download_txt(view)
    disable_client_cache
    send_data(view.to_text, :filename => "#{@filename}.txt")
  end

  def download_csv(view)
    disable_client_cache
    send_data(view.to_csv, :filename => "#{@filename}.csv")
  end

  # Send the current report in pdf format
  def download_pdf(view)
    render_pdf_internal(view)
  end

  def report_from_task_id(task_id)
    MiqTask.find(task_id).task_results
  end

  def report_from_report_results(report_result_id)
    rr = MiqReportResult.for_user(current_user).find(session[:report_result_id])
    report = rr.report_results
    report.report_run_time = rr.last_run_on
    report
  end

  def report_for_rendering
    if session[:rpt_task_id]
      report_from_task_id(session[:rpt_task_id])
    elsif session[:report_result_id]
      report_from_report_results(session[:report_result_id])
    end
  end

  def filename_timestamp(basename, format = 'fname')
    basename + '_' + format_timezone(Time.zone.now, Time.zone, format)
  end

  def set_summary_pdf_data
    @showtype    = @display
    run_time     = Time.now
    klass        = ui_lookup(:model => @record.class.name)

    @options = {
      :page_layout => "portrait",
      :page_size   => "us-letter",
      :run_date    => run_time.strftime("%m/%d/%y %l:%m %p %z"),
      :title       => "#{klass} \"#{@record.name}\"".html_safe,
      :quadicon    => true
    }

    if @display == "download_pdf"
      @display = "main"
      if @record.kind_of?(VmOrTemplate)
        get_host_for_vm(@record)
      end

      disable_client_cache
      render :template => '/layouts/print/textual_summary', :layout => '/layouts/print'
    end
  end
end
