class MiddlewareServerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include EmsCommon
  include MiddlewareCommonMixin
  include Mixins::MiddlewareDeploymentsMixin


  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  COMMON_OPERATIONS = {
    :middleware_server_reload  => {
      :op           => :reload_middleware_server,
      :log_timeline => 'MwServer.Reload.UserRequest',
      :skip         => true,
      :hawk         => N_('reloading'),
      :msg          => N_('Reload')
    },
    :middleware_server_suspend => {
      :op           => :suspend_middleware_server,
      :log_timeline => 'MwServer.Suspend.UserRequest',
      :skip         => true,
      :hawk         => N_('suspending'),
      :msg          => N_('Suspend'),
      :param        => :timeout
    },
    :middleware_server_resume  => {
      :op           => :resume_middleware_server,
      :log_timeline => 'MwServer.Resume.UserRequest',
      :skip         => true,
      :hawk         => N_('resuming'),
      :msg          => N_('Resume')
    },
    :middleware_dr_generate    => {
      :op   => :generate_diagnostic_report,
      :skip => false,
      :hawk => N_('generating JDR report'),
      :msg  => N_('Generate JDR report')
    }
  }.freeze

  STANDALONE_ONLY = {
    :middleware_server_stop     => {
      :op           => :stop_middleware_server,
      :log_timeline => 'MwServer.Shutdown.UserRequest',
      :skip         => true,
      :hawk         => N_('stopping'),
      :msg          => N_('Stop')
    },
    :middleware_server_shutdown => {
      :op           => :shutdown_middleware_server,
      :log_timeline => 'MwServer.Shutdown.UserRequest',
      :skip         => true,
      :hawk         => N_('shutting down'),
      :msg          => N_('Shutdown'),
      :param        => :timeout
    },
    :middleware_server_restart  => {
      :op           => :restart_middleware_server,
      :log_timeline => 'MwServer.Restart.UserRequest',
      :skip         => true,
      :hawk         => N_('restarting'),
      :msg          => N_('Restart')
    },
    :middleware_add_deployment  => {
      :op    => :add_middleware_deployment,
      :skip  => false,
      :hawk  => N_('Not deploying to Hawkular server'),
      :msg   => N_('Deployment initiated for selected server(s)'),
      :param => :file
    },
    :middleware_add_jdbc_driver => {
      :op    => :add_middleware_jdbc_driver,
      :skip  => false,
      :msg   => N_('JDBC Driver installation'),
      :param => :driver
    },
    :middleware_add_datasource  => {
      :op    => :add_middleware_datasource,
      :skip  => false,
      :hawk  => N_('Not adding new datasource to Hawkular server'),
      :msg   => N_('New datasource initiated for selected server(s)'),
      :param => :datasource
    }
  }.freeze

  DOMAIN_ONLY = {
    :middleware_domain_server_start   => {
      :op           => :start_middleware_domain_server,
      :log_timeline => 'MwServer.Start.UserRequest',
      :skip         => true,
      :hawk         => N_('starting'),
      :msg          => N_('Start')
    },
    :middleware_domain_server_stop    => {
      :op           => :stop_middleware_domain_server,
      :log_timeline => 'MwServer.Stop.UserRequest',
      :skip         => true,
      :hawk         => N_('stopping'),
      :msg          => N_('Stop')
    },
    :middleware_domain_server_restart => {
      :op           => :restart_middleware_domain_server,
      :log_timeline => 'MwServer.Restart.UserRequest',
      :skip         => true,
      :hawk         => N_('restarting'),
      :msg          => N_('Restart')
    },
    :middleware_domain_server_kill    => {
      :op           => :kill_middleware_domain_server,
      :log_timeline => 'MwServer.Kill.UserRequest',
      :skip         => true,
      :hawk         => N_('killing'),
      :msg          => N_('Kill')
    },
  }.freeze

  STANDALONE_SERVER_OPERATIONS = COMMON_OPERATIONS.merge(STANDALONE_ONLY)
  DOMAIN_SERVER_OPERATIONS = COMMON_OPERATIONS.merge(DOMAIN_ONLY)
  ALL_OPERATIONS = STANDALONE_SERVER_OPERATIONS.merge(DOMAIN_SERVER_OPERATIONS)

  def self.operations
    ALL_OPERATIONS
  end

  def add_jdbc_driver
    selected_server = identify_selected_entities

    params[:driver] = {
      :file                 => params["file"],
      :driver_name          => params["driverName"],
      :driver_jar_name      => params["driverJarName"],
      :module_name          => params["moduleName"],
      :driver_class         => params["driverClass"],
      :driver_major_version => params["majorVersion"],
      :driver_minor_version => params["minorVersion"]
    }

    run_server_operation(STANDALONE_SERVER_OPERATIONS.fetch(:middleware_add_jdbc_driver), selected_server)
    render :json => {
      :status => :success, :msg => _("JDBC Driver \"%s\" has been submitted for installation on this server.") % params["driverName"]
    }
  end

  def jdbc_drivers
    mw_server = MiddlewareServer.find(from_cid(params[:server_id]))
    mw_manager = mw_server.ext_management_system
    drivers = mw_manager.jdbc_drivers(mw_server.feed)

    render :json => {
      :status => :success, :data => drivers
    }
  rescue StandardError => _err
    render :json => {
      :status => :internal_server_error,
      :data   => {
        :msg => _("Cannot connect to provider \"%{provider}\" of server \"%{server}\". Is it running?") %
                {
                  :provider => mw_manager.name,
                  :server   => mw_server.name
                }
      }
    }
  end

  def add_datasource
    datasource_name = params["datasourceName"]
    selected_server = identify_selected_entities
    existing_datasource = MiddlewareDatasource.find_by(:name => datasource_name, :server_id => selected_server)

    if existing_datasource
      render :json => {
        :status => :warn, :msg => _("Datasource \"%s\" already exists on this server.") % datasource_name
      }
    else
      params[:datasource] = {
        :datasourceName       => datasource_name,
        :xaDatasource         => params["xaDatasource"],
        :jndiName             => params["jndiName"],
        :driverName           => params["driverName"],
        :driverClass          => params["driverClass"],
        :connectionUrl        => params["connectionUrl"],
        :userName             => params["userName"],
        :password             => params["password"],
        :securityDomain       => params["securityDomain"],
        :datasourceProperties => params["datasourceProperties"]
      }

      run_server_operation(STANDALONE_SERVER_OPERATIONS.fetch(:middleware_add_datasource), selected_server)
      render :json => {
        :status => :success, :msg => _("Datasource \"%s\" installation has started on this server.") % datasource_name
      }
    end
  end

  def dr_download
    mw_server = find_record_with_rbac(MiddlewareServer, params[:id])
    begin
      diagnostic_report = mw_server.middleware_diagnostic_reports.find(from_cid(params[:key]))
    rescue ActiveRecord::RecordNotFound
      redirect_to(:action      => 'show',
                  :id          => to_cid(mw_server.id),
                  :flash_msg   => _("Unable to locate a report in database, please try again."),
                  :flash_error => true)
      return
    end

    response.headers['Content-Type'] = 'application/zip'
    response.headers['Content-Disposition'] = "attachment; filename=#{diagnostic_report.binary_blob.name}"
    response.headers['Content-Length'] = diagnostic_report.binary_blob.size

    self.response_body = Enumerator.new do |y|
      diagnostic_report.binary_blob.binary_blob_parts.find_each(:batch_size => 5) do |part|
        y << part.data
      end
    end
  end

  def dr_delete
    mw_server = find_record_with_rbac(MiddlewareServer, params[:id])
    selected_drs = if params['mw_dr_selected'].respond_to?(:map)
                     params['mw_dr_selected'].map { |item| from_cid(item) }
                   else
                     [from_cid(params['mw_dr_selected'])]
                   end
    begin
      reports = mw_server.middleware_diagnostic_reports.find(selected_drs)
    rescue ActiveRecord::RecordNotFound
      add_flash(_("Unable to locate all reports in database, please try again."), :error)
    else
      mw_server.middleware_diagnostic_reports.destroy(reports)
      add_flash(n_('Deletion of one JDR report succeeded.',
                   "Deletion of %{count} JDR reports succeeded.",
                   reports.count) % {:count => reports.count})
    end
    session[:flash_msgs] = @flash_array
    redirect_to(:action => 'show', :id => to_cid(mw_server.id))
  end

  def dr_report_download
    dr_class = ManageIQ::Providers::Hawkular::MiddlewareManager::MiddlewareDiagnosticReport

    mw_server = find_record_with_rbac(MiddlewareServer, params[:id])
    report = MiqReport.load_from_view_options(dr_class, current_user)
    report.build_table(mw_server.middleware_diagnostic_reports, dr_class, :no_sort => true)
    @filename = filename_timestamp(report.title)
    download_csv(report) if params[:download_type] == 'csv'
    download_txt(report) if params[:download_type] == 'text'
  end

  def self.display_methods
    %w(middleware_datasources middleware_deployments middleware_messagings)
  end

  def self.default_show_template
    "#{model.name.underscore}/show"
  end

  def button
    selected_operation = params[:pressed].to_sym

    if ALL_OPERATIONS.key?(selected_operation)
      selected_servers = identify_selected_entities

      run_server_operation(ALL_OPERATIONS.fetch(selected_operation), selected_servers)

      javascript_flash
    else
      super
    end
  end

  def run_operation
    selected_servers = identify_selected_servers
    if selected_servers.nil?
      render :json => {:status => :error, :msg => _("No Servers selected")}
      return
    end

    operation = ('middleware_server_' + params["operation"]).to_sym
    if ALL_OPERATIONS.key?(operation)
      operation_info = ALL_OPERATIONS.fetch(operation)
      run_server_param_operation(operation_info, selected_servers)
    else
      msg = _("Unknown server operation: %{operation}") % {:operation => operation.to_s}
      render :json => {:status => :error, :msg => msg}
    end
  end

  private

  def textual_group_list
    [%i(properties smart_management), %i(compliance relationships)]
  end
  helper_method :textual_group_list

  # Identify the selected servers. When we got the call from the
  # single server page, we need to look at :id, otherwise from
  # the list of servers we need to query :miq_grid_checks
  def identify_selected_servers
    items = params[:miq_grid_checks]
    return items unless items.nil? || items.empty?

    params[:id]
  end

  def run_server_param_operation(operation_info, mw_servers)
    operation_triggered = false
    mw_servers.split(/,/).each do |mw_server|
      mw_server = identify_record mw_server

      if mw_server.product == 'Hawkular' && operation_info.fetch(:skip)
        skip_message = _("Not %{operation_info} the provider") % {:operation_info => operation_info.fetch(:hawk)}
        render :json => {:status => :ok, :msg => skip_message}
      elsif mw_server.in_domain? && !DOMAIN_SERVER_OPERATIONS.value?(operation_info)
        skip_message = _("Not %{operation_info} the domain server") % {:operation_info => operation_info.fetch(:hawk)}
        render :json => {:status => :ok, :msg => skip_message}
      else
        operation_triggered = trigger_param_operation(operation_info, mw_server, :param)
        log_operation_in_timeline(operation_info, mw_server)
      end
      if operation_triggered
        initiated_msg = _("%{operation} initiated for selected server(s)") % {:operation => operation_info.fetch(:msg)}
        render :json => {:status => :ok, :msg => initiated_msg}
      end
    end
  end

  def trigger_param_operation(operation_info, mw_server, op_param)
    if operation_info.key? op_param
      name = operation_info.fetch(op_param) # which currently evaluates to :timeout
      val = params["timeout"]
      trigger_mw_operation operation_info.fetch(:op), mw_server, name => val
    else
      trigger_mw_operation operation_info.fetch(:op), mw_server
    end
    true
  end

  def run_server_operation(operation_info, items)
    if items.nil?
      add_flash(_("No servers selected"))
      return
    end

    operation_triggered = false
    items.split(/,/).each do |item|
      mw_server = identify_record item
      if mw_server.product == 'Hawkular' && operation_info.fetch(:skip)
        add_flash(_("Not %{hawkular_info} the provider") % {:hawkular_info => operation_info.fetch(:hawk)})
      else
        if operation_info.fetch(:op) == :generate_diagnostic_report
          mw_server.enqueue_diagnostic_report(:requesting_user => current_userid)
        else
          run_operation_on_record(operation_info, mw_server)
        end
        operation_triggered = true
        log_operation_in_timeline(operation_info, mw_server)
      end
    end
    add_flash(_("%{operation} initiated for selected server(s)") % {:operation => operation_info.fetch(:msg)}) if operation_triggered
  end

  def trigger_mw_operation(operation, mw_server, params = {})
    mw_manager = mw_server.ext_management_system

    if mw_server.kind_of?(MiddlewareDeployment)
      mw_manager.public_send(operation, mw_server.ems_ref, mw_server.feed, mw_server.name)
    else
      extra_params = [params]

      if mw_server.respond_to?(:in_domain?) && mw_server.in_domain?
        extra_params << {:server_in_domain => true}
      end

      mw_manager.public_send(operation, mw_server.ems_ref, mw_server.feed, *extra_params)
    end
  end

  menu_section :mdl
end
