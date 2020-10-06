module VmRemote
  extend ActiveSupport::Concern

  def vmrc_console
    params[:task_id] ? console_after_task('vmrc') : console_before_task('vmrc')
  end

  def launch_cockpit
    vm = identify_record(params[:id], VmOrTemplate)

    disable_client_cache

    if vm.supports_launch_cockpit?
      javascript_open_window(vm.cockpit_url.to_s)
    else
      javascript_flash(:text => vm.unsupported_reason(:launch_cockpit), :severity => :error, :spinner_off => true)
    end
  end

  def html5_console
    params[:task_id] ? console_after_task('html5') : console_before_task('html5')
  end

  def native_console
    native_console_launch_task
  end

  def launch_native_console
    miq_task = MiqTask.find(params[:task_id])
    results = miq_task.task_results

    disable_client_cache
    send_data(Base64.decode64(results[:connection]), :type => results[:type], :filename => results[:name])
  end

  def launch_vmrc_console
    render :template => "vm_common/console_vmrc", :layout => false, :locals => params.slice(:remote_url)
  end

  def launch_html5_console
    override_content_security_policy_directives(:connect_src => ["'self'", websocket_origin], :img_src => %w[data: blob: 'self'])
    %i[secret url proto].each { |p| params.require(p) }

    proto = j(params[:proto]).sub(/\-.*$/, '') # -suffix should be omitted from the protocol name
    if %w[vnc spice webmks].include?(proto)
      @console = {
        :url       => j(params[:url]),
        :secret    => j(params[:secret]),
        :is_vcloud => j(params[:is_vcloud]), # vCloud specific
        :vmx       => j(params[:vmx]), # vCloud specific
        :type      => proto
      }
      render(:template => 'layouts/remote_console', :layout => false)
    else
      raise 'Unsupported protocol'
    end
  end

  private

  # First time thru, kick off the acquire ticket task
  def console_before_task(console_type)
    ticket_type = console_type.to_sym

    record = identify_record(params[:id], VmOrTemplate)
    ems = record.ext_management_system
    if ems.class.ems_type == 'vmwarews'
      begin
        ems.validate_remote_console_vmrc_support
      rescue MiqException::RemoteConsoleNotSupportedError => e
        add_flash(_("Console access failed: %{message}") % {:message => e.message}, :error)
        javascript_flash(:spinner_off => true)
        return
      end
    end

    task_id = record.remote_console_acquire_ticket_queue(ticket_type, session[:userid])
    unless task_id.kind_of?(Integer)
      add_flash(_("Console access failed: Task start failed"), :error)
    end

    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      initiate_wait_for_task(:task_id => task_id)
    end
  end

  # Task complete, show error or launch console using VNC/SPICE/WebMKS/VMRC task info
  def console_after_task(console_type)
    miq_task = MiqTask.find(params[:task_id])
    unless miq_task.results_ready?
      add_flash(_("Console access failed: %{message}") % {:message => miq_task.message}, :error)
    end
    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      url = if miq_task.task_results[:remote_url]
              miq_task.task_results[:remote_url]
            elsif console_type == 'html5'
              url_for_only_path(:controller => controller_name,
                                :action     => 'launch_html5_console',
                                :id         => j(params[:id]),
                                :params     => miq_task.task_results)
            end
      javascript_open_window(url)
    end
  end

  def native_console_launch_task
    record = identify_record(params[:id], VmOrTemplate)

    task_id = record.native_console_connection_queue(session[:userid])
    unless task_id.kind_of?(Integer)
      add_flash(_("Native console access failed: Task start failed"), :error)
    end

    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      initiate_wait_for_task(:task_id => task_id, :action => 'native_console_task_complete')
    end
  end

  def native_console_task_complete
    miq_task = MiqTask.find(params[:task_id])
    unless miq_task.results_ready?
      add_flash(_("Native console access failed: %{message}") % {:message => miq_task.message}, :error)
    end

    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      url = url_for_only_path(:controller => controller_name,
                              :action     => 'launch_native_console',
                              :id         => j(params[:id]),
                              :params     => {:task_id => miq_task.id})
      javascript_open_window(url)
    end
  end
end
