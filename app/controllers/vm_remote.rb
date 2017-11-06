module VmRemote
  extend ActiveSupport::Concern

  # Launch a VM console
  def console
    console_type = ::Settings.server.remote_console_type.downcase
    params[:task_id] ? console_after_task(console_type) : console_before_task(console_type)
  end
  alias vmrc_console console # VMRC needs its own URL for RBAC checking

  def launch_cockpit
    vm = identify_record(params[:id], VmOrTemplate)

    if vm.supports_launch_cockpit?
      javascript_open_window(vm.cockpit_url.to_s)
    else
      javascript_flash(:text => vm.unsupported_reason(:launch_cockpit), :severity => :error, :spinner_off => true)
    end
  end

  def html5_console
    params[:task_id] ? console_after_task('html5') : console_before_task('html5')
  end

  def launch_vmware_console
    console_type = ::Settings.server.remote_console_type.downcase
    @vm = @record = identify_record(params[:id], VmOrTemplate)
    options = case console_type
              when "webmks"
                override_content_security_policy_directives(
                  :connect_src => ["'self'", "wss://#{params[:host]}"]
                )
                {
                  :webmks_uri => URI::Generic.build(:scheme => 'wss',
                                                    :host   => params[:host],
                                                    :port   => params[:port],
                                                    :path   => "/ticket/#{params[:ticket]}")
                }
              when "vmrc"
                host = @record.ext_management_system.hostname || @record.ext_management_system.ipaddress
                vmid = @record.ems_ref
                {
                  :host        => host,
                  :vmid        => @record.ems_ref,
                  :ticket      => j(params[:ticket]),
                  :api_version => @record.ext_management_system.api_version.to_s,
                  :os          => browser_info(:os),
                  :name        => @record.name,
                  :vmrc_uri    => build_vmrc_uri(host, vmid, params[:ticket])
                }
              end
    render :template => "vm_common/console_#{console_type}",
           :layout   => false,
           :locals   => options
  end

  def launch_html5_console
    override_content_security_policy_directives(:connect_src => ["'self'", websocket_origin], :img_src => %w(data: self))
    %i(secret url proto).each { |p| params.require(p) }

    proto = j(params[:proto])
    if %w(vnc spice).include?(proto) # VMWare, RHEV
      @console = {
        :url    => j(params[:url]),
        :secret => j(params[:secret]),
        :type   => proto
      }
      render(:template => 'layouts/remote_console', :layout => false)
    else
      raise 'Unsupported protocol'
    end
  end

  #
  # When the user clicks the `oVirt UI` button the UI will send a POST request to this method. But
  # it does so from JavaScript, using XHR, so we can't just redirect to the oVirt UI, because the
  # browser will ignore the redirect. Instead of that we will send back instructions to open a new
  # window for the oVirt URL.
  #
  def post_ovirt_ui
    # Retrieve the virtual machine:
    vm = identify_record(params[:id], Vm)

    # Queue a task for the provider to generate the URL:
    task_id = vm.queue_generate_ui_url

    # Wait for the result of the task:
    task = MiqTask.wait_for_taskid(task_id, sleep_time: 1)

    # Send instructions to render the URL returned by the provider:
    javascript_open_window(task.task_results)
  end

  private

  # First time thru, kick off the acquire ticket task
  def console_before_task(console_type)
    ticket_type = console_type.to_sym

    record = identify_record(params[:id], VmOrTemplate)
    ems = record.ext_management_system
    if ems.class.ems_type == 'vmwarews'
      ticket_type = :vnc if console_type == 'html5'
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
      add_flash(_("Console access failed: Task start failed: ID [%{id}]") %
                  {:id => task_id.to_s}, :error)
    end

    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      initiate_wait_for_task(:task_id => task_id)
    end
  end

  # Task complete, show error or launch console using VNC/WebMKS/VMRC task info
  def console_after_task(console_type)
    miq_task = MiqTask.find(params[:task_id])
    unless miq_task.results_ready?
      add_flash(_("Console access failed: %{message}") % {:message => miq_task.message}, :error)
    end
    if @flash_array
      javascript_flash(:spinner_off => true)
    else # open a window to show a VNC or VMWare console
      url = if miq_task.task_results[:remote_url]
              miq_task.task_results[:remote_url]
            else
              console_action = console_type == 'html5' ? 'launch_html5_console' : 'launch_vmware_console'
              url_for_only_path(:controller => controller_name,
                                :action     => console_action,
                                :id         => j(params[:id]),
                                :params     => miq_task.task_results)
            end
      javascript_open_window(url)
    end
  end

  def build_vmrc_uri(host, vmid, ticket)
    uri = URI::Generic.build(:scheme   => "vmrc",
                             :userinfo => "clone:#{ticket}",
                             :host     => host,
                             :port     => 443,
                             :path     => "/",
                             :query    => "moid=#{vmid}").to_s
    # VMRC doesn't like brackets around IPv6 addresses
    uri.sub(/(.*)\[/, '\1').sub(/(.*)\]/, '\1')
  end
end
