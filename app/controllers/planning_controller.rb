class PlanningController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  menu_section(:opt)

  def index
    @explorer = true
    @accords = [{:name => "planning", :title => _("Planning Options"), :container => "planning_options_accord"}]

    self.x_active_tree = nil
    @sb[:active_tab] = "summary"
    @layout = "miq_capacity_planning"

    build_options
    render :layout => "application"
  end

  def plan
    @explorer = true
    @accords = [{:name => "planning", :title => _("Planning Options"), :container => "planning_options_accord"}]

    self.x_active_tree = nil
    @sb[:active_tab] = "summary"
    @layout = "miq_capacity_planning"

    vm_opts = VimPerformancePlanning.vm_default_options(@sb[:planning][:options][:vm_mode])
    if (vm_opts[:cpu] && @sb[:planning][:options][:trend_cpu]) || # Check that at least one required metric is checked
       (vm_opts[:vcpus] && @sb[:planning][:options][:trend_vcpus]) ||
       (vm_opts[:memory] && @sb[:planning][:options][:trend_memory]) ||
       (vm_opts[:storage] && @sb[:planning][:options][:trend_storage])
      perf_planning_gen_data
      @sb[:planning][:options][:submitted_vm_mode] = @sb[:planning][:options][:vm_mode] # Save for display
      if @sb[:planning][:rpt]
        replace_right_cell
      elsif @sb[:planning][:no_data] # to prevent double render error, making sure it's not wait_for_task transaction
        add_flash(_("No Utilization data available to generate planning results"), :warning)
        render :update do |page|
          page << javascript_prologue
          page.replace("planning_options_div", :partial => "planning_options")
          page << "miqSparkle(false);"
        end
      end
    else
      add_flash(_("At least one VM Option must be selected"), :error)
      render :update do |page|
        page << javascript_prologue
        page.replace("planning_options_div", :partial => "planning_options")
        page << "miqSparkle(false);"
      end
    end
  end

  def option_changed
    if params[:filter_typ].present?
      filter_typ = params[:filter_typ] == "<Choose>" ? nil : params[:filter_typ]

      @sb[:planning][:options][:filter_typ] = filter_typ
      @sb[:planning][:vms] = wizard_get_vms('all', nil) if filter_typ == 'all'
    end

    if params[:filter_value].present?
      filter_value = params[:filter_value] == "<Choose>" ? nil : params[:filter_value]

      @sb[:planning][:options][:filter_value] = filter_value
      @sb[:planning][:vms] = wizard_get_vms(@sb[:planning][:options][:filter_typ], filter_value)
    end

    @sb[:planning][:options][:chosen_vm] = params[:chosen_vm] == "<Choose>" ? nil : params[:chosen_vm] if params[:chosen_vm]
    @sb[:planning][:options][:days] = params[:trend_days].to_i if params[:trend_days]
    @sb[:planning][:options][:vm_mode] = _(VALID_PLANNING_VM_MODES[params[:vm_mode]]) if params[:vm_mode]
    @sb[:planning][:options][:trend_cpu] = (params[:trend_cpu] == "1") if params[:trend_cpu]
    @sb[:planning][:options][:trend_vcpus] = (params[:trend_vcpus] == "1") if params[:trend_vcpus]
    @sb[:planning][:options][:trend_memory] = (params[:trend_memory] == "1") if params[:trend_memory]
    @sb[:planning][:options][:trend_storage] = (params[:trend_storage] == "1") if params[:trend_storage]
    @sb[:planning][:options][:tz] = params[:planning_tz] if params[:planning_tz]
    if params.key?(:time_profile)
      tp = TimeProfile.find(params[:time_profile]) unless params[:time_profile].blank?
      @sb[:planning][:options][:time_profile] = params[:time_profile].blank? ? nil : params[:time_profile].to_i
      @sb[:planning][:options][:time_profile_tz] = params[:time_profile].blank? ? nil : tp.tz
      @sb[:planning][:options][:time_profile_days] = params[:time_profile].blank? ? nil : tp.days
    end
    if params[:target_typ]
      @sb[:planning][:options][:target_typ] = params[:target_typ]
      @sb[:planning][:options][:target_filters] = MiqSearch.where(:id => params[:target_typ]).descriptions
      @sb[:planning][:options][:target_filter] = nil
    end
    @sb[:planning][:options][:target_filter] = params[:target_filter].blank? ? nil : params[:target_filter] if params.key?(:target_filter)
    @sb[:planning][:options][:limit_cpu] = params[:limit_cpu].to_i if params[:limit_cpu]
    @sb[:planning][:options][:limit_vcpus] = params[:limit_vcpus].to_i if params[:limit_vcpus]
    @sb[:planning][:options][:limit_memory] = params[:limit_memory].to_i if params[:limit_memory]
    @sb[:planning][:options][:limit_storage] = params[:limit_storage].to_i if params[:limit_storage]
    @sb[:planning][:options][:display_vms] = params[:display_vms].blank? ? nil : params[:display_vms].to_i if params.key?(:display_vms)

    @sb[:planning][:options][:values][:cpu] = params[:trend_cpu_val].to_i if params[:trend_cpu_val]
    @sb[:planning][:options][:values][:vcpus] = params[:trend_vcpus_val].to_i if params[:trend_vcpus_val]
    @sb[:planning][:options][:values][:memory] = params[:trend_memory_val].to_i if params[:trend_memory_val]
    @sb[:planning][:options][:values][:storage] = params[:trend_storage_val].to_i if params[:trend_storage_val]

    get_vm_values if params[:chosen_vm] || # Refetch the VM values if any of these options change
                     params[:vm_mode] ||
                     params[:trend_days] ||
                     params[:tz] ||
                     params[:time_profile]

    @sb[:planning][:vm_opts] = VimPerformancePlanning.vm_default_options(@sb[:planning][:options][:vm_mode])
    unless (@sb[:planning][:vm_opts][:cpu] && @sb[:planning][:options][:trend_cpu]) || # Check that at least one required metric is checked
           (@sb[:planning][:vm_opts][:vcpus] && @sb[:planning][:options][:trend_vcpus]) ||
           (@sb[:planning][:vm_opts][:memory] && @sb[:planning][:options][:trend_memory]) ||
           (@sb[:planning][:vm_opts][:storage] && @sb[:planning][:options][:trend_storage])
      add_flash(_("At least one VM Option must be selected"), :error)
      @sb[:planning][:options][:trend_cpu] = true if params[:trend_cpu]
      @sb[:planning][:options][:trend_vcpus] = true if params[:trend_vcpus]
      @sb[:planning][:options][:trend_memory] = true if params[:trend_memory]
      @sb[:planning][:options][:trend_storage] = true if params[:trend_storage]
    end
    if params.key?(:display_vms)
      perf_planning_gen_data
      replace_right_cell
    else
      render :update do |page|
        page << javascript_prologue
        unless params[:trend_cpu_val] || # Don't replace the div when input fields change
               params[:trend_vcpus_val] ||
               params[:trend_memory_val] ||
               params[:trend_storage_val]
          page.replace("planning_options_div", :partial => "planning_options")
        end
        session[:changed] = @sb[:planning][:options][:chosen_vm] || @sb[:planning][:options][:vm_mode] == :manual
        page << javascript_for_miq_button_visibility(session[:changed])
      end
    end
  end

  def change_tab
    @sb[:active_tab] = params[:tab_id]

    # build timeline data when coming back to Summary tab for bottlenecks
    displaying_timeline = (x_active_tree == :bottlenecks_tree && @sb[:active_tab] == "summary")
    bottleneck_get_node_info(x_node) if displaying_timeline

    render :update do |page|
      page << javascript_prologue
      page << javascript_reload_toolbars
      page.replace("tl_div", :partial => "bottlenecks_tl_detail") if displaying_timeline
      page << Charting.js_load_statement
      page << "miqSparkle(false);"
    end
  end

  # Send the current planning report data in text, CSV, or PDF
  def report_download
    profile = []
    profile.push("CPU #{@sb[:planning][:rpt].extras[:vm_profile][:cpu]}") if @sb[:planning][:rpt].extras[:vm_profile][:cpu]
    profile.push("RAM #{@sb[:planning][:rpt].extras[:vm_profile][:memory]}") if @sb[:planning][:rpt].extras[:vm_profile][:memory]
    profile.push("Disk #{@sb[:planning][:rpt].extras[:vm_profile][:storage]}") if @sb[:planning][:rpt].extras[:vm_profile][:storage]
    @sb[:planning][:rpt].title = _("Counts of VMs (%{profile})") % {:profile => profile.join(", ")}
    filename = "VM Counts per #{ui_lookup(:model => @sb[:planning][:options][:target_typ])}"
    disable_client_cache
    case params[:typ]
    when "txt"
      send_data(@sb[:planning][:rpt].to_text,
                :filename => "#{filename}.txt")
    when "csv"
      send_data(@sb[:planning][:rpt].to_csv,
                :filename => "#{filename}.csv")
    when "pdf"
      render_pdf(@sb[:planning][:rpt])
    end
  end

  def reset
    @explorer = true
    @accords = [{:name => "planning", :title => _("Planning Options"), :container => "planning_options_accord"}]

    self.x_active_tree = nil
    @sb[:active_tab] = "summary"
    @layout = "miq_capacity_planning"

    planning_build_options
  end

  private

  def get_session_data
    @title = _("Planning")
    @layout ||= "miq_capacity_planning"
  end

  def wizard_get_vms_records(filter_type, filter_value)
    case filter_type
    when "all"     then find_filtered(Vm).sort_by { |v| v.name.downcase }
    when "host"    then Host.find(filter_value).vms
    when "ems"     then ExtManagementSystem.find(filter_value).vms
    when "cluster" then EmsCluster.find(filter_value).all_vms
    when "filter"  then MiqSearch.find(filter_value).results(:userid => current_userid)
    else []
    end
  end

  def wizard_get_vms(filter_type, filter_value)
    vms = Rbac.filtered(wizard_get_vms_records(filter_type, filter_value))
    vms.each_with_object({}) do |v, h|
      description = v.ext_management_system ? "#{v.ext_management_system.name}:#{v.name}" : v.name
      h[v.id.to_s] = description
    end
  end

  def build_options
    @sb[:planning] ||= {} # Leave existing values
    @sb[:planning] = {} if params[:button] == "reset" # Clear everything on reset
    @sb[:planning][:options] ||= {} # Leave existing values
    @sb[:planning][:options][:days] ||= 7
    @sb[:planning][:options][:vm_mode] ||= :allocated
    @sb[:planning][:options][:trend_cpu] = true if @sb[:planning][:options][:trend_cpu].nil?
    @sb[:planning][:options][:trend_vcpus] = true if @sb[:planning][:options][:trend_vcpus].nil?
    @sb[:planning][:options][:trend_memory] = true if @sb[:planning][:options][:trend_memory].nil?
    @sb[:planning][:options][:trend_storage] = true if @sb[:planning][:options][:trend_storage].nil?
    @sb[:planning][:options][:tz] ||= session[:user_tz]
    @sb[:planning][:options][:values] ||= {}
    get_vm_values
    get_time_profiles # Get time profiles list (global and user specific)

    # Get the time zone from the time profile, if one is in use
    if @sb[:planning][:options][:time_profile]
      tp = TimeProfile.find_by(:id => @sb[:planning][:options][:time_profile])
      set_time_profile_vars(tp, @sb[:planning][:options])
    else
      set_time_profile_vars(selected_time_profile_for_pull_down, @sb[:planning][:options])
    end

    @sb[:planning][:options][:target_typ] ||= "EmsCluster"
    @sb[:planning][:options][:target_filters] = MiqSearch.where(:db => @sb[:planning][:options][:target_typ]).descriptions
    @sb[:planning][:options][:limit_cpu] ||= 90
    @sb[:planning][:options][:limit_vcpus] ||= 10
    @sb[:planning][:options][:limit_memory] ||= 90
    @sb[:planning][:options][:limit_storage] ||= 90
    @sb[:planning][:options][:display_vms] ||= 100

    @sb[:planning][:emss] = {}
    find_filtered(ExtManagementSystem).each { |e| @sb[:planning][:emss][e.id.to_s] = e.name }
    @sb[:planning][:clusters] = {}
    find_filtered(EmsCluster).each { |e| @sb[:planning][:clusters][e.id.to_s] = e.name }
    @sb[:planning][:hosts] = {}
    find_filtered(Host).each { |e| @sb[:planning][:hosts][e.id.to_s] = e.name }
    @sb[:planning][:datastores] = {}
    find_filtered(Storage).each { |e| @sb[:planning][:datastores][e.id.to_s] = e.name }
    @sb[:planning][:vm_filters] = MiqSearch.where(:db => "Vm").descriptions
    @right_cell_text = _("Planning Summary")
    if params[:button] == "reset"
      session[:changed] = false
      add_flash(_("Planning options have been reset by the user"))

      render :update do |page|
        page << javascript_prologue
        page << "$('#toolbar').show();"
        page << javascript_reload_toolbars
        page << javascript_for_miq_button_visibility(session[:changed])
        page.replace("planning_options_div", :partial => "planning_options")
        @flash_array = nil # Make sure to reset flash message after initial display
        page.replace_html("main_div", :partial => "planning_tabs")
      end
    end
    if @sb[:planning] && @sb[:planning][:chart_data] # If planning charts already exist
      @perf_record = MiqEnterprise.first
    end
  end

  # Get the metric values for the selected VM based on the mode
  def get_vm_values
    return if @sb[:planning][:options][:vm_mode] == :manual
    if @sb[:planning][:options][:chosen_vm]
      @sb[:planning][:options][:values] = {}
      vm_options = VimPerformancePlanning.vm_default_options(@sb[:planning][:options][:vm_mode])
      VimPerformancePlanning.vm_metric_values(Vm.find(@sb[:planning][:options][:chosen_vm]),
                                              :vm_options      => vm_options,
                                              :range           => {
                                                :days     => @sb[:planning][:options][:days],
                                                :end_date => perf_planning_end_date
                                              },
                                              :tz              => @sb[:planning][:options][:tz],
                                              :time_profile_id => @sb[:planning][:options][:time_profile])
      vm_options.each do |k, v|
        next if v.nil?
        @sb[:planning][:options][:values][k] = if k == :storage
                                                 (v[:value].to_i / 1.gigabyte).round
                                               else
                                                 v[:value].to_i.round
                                               end
      end
    end
  end

  def replace_right_cell
    v_tb = build_toolbar("miq_capacity_view_tb")
    presenter = ExplorerPresenter.new(:active_tree => @sb[:active_tree])

    presenter.load_chart(@sb[:planning][:chart_data])

    presenter.reload_toolbars(:view => v_tb)
    presenter.set_visibility(@sb[:active_tab] == 'report', :toolbar)

    presenter.update(:main_div, r[:partial => 'planning_tabs'])
    presenter[:replace_cell_text] = if @sb[:planning][:options][:target_typ] == 'Host'
                                      _("Best Fit Hosts")
                                    else
                                      _("Best Fit Clusters")
                                    end

    render :json => presenter.for_render
  end
end
