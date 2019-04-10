class PlanningController < ApplicationController
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data

  menu_section(:opt)

  VALID_PLANNING_VM_MODES = PlanningHelper::PLANNING_VM_MODES.keys.index_by(&:to_s)

  def index
    @explorer = true

    self.x_active_tree = nil
    @sb[:active_tab] = "summary"
    @layout = "miq_capacity_planning"

    build_options
    render :layout => "application"
  end

  def plan
    @explorer = true

    self.x_active_tree = nil
    @sb[:active_tab] = "summary"
    @layout = "miq_capacity_planning"

    vm_opts = VimPerformancePlanning.vm_default_options(@sb[:options][:vm_mode])
    # Check that at least one required metric is checked
    if [%i[cpu trend_cpu], %i[vcpus trend_vcpus], %i[memory trend_memory], %i[storage trend_storage]].any? { |x, y| vm_opts[x] && @sb[:options][y] }
      perf_planning_gen_data
      @sb[:options][:submitted_vm_mode] = @sb[:options][:vm_mode] # Save for display
      if @sb[:rpt]
        replace_right_cell
      elsif @sb[:no_data] # to prevent double render error, making sure it's not wait_for_task transaction
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

      @sb[:options][:filter_typ] = filter_typ
      @sb[:vms] = filter_typ == 'all' ? wizard_get_vms('all', nil) : nil
      @sb[:options][:filter_value] = @sb[:options][:chosen_vm] = nil
    end

    if params[:filter_value].present?
      filter_value = params[:filter_value] == "<Choose>" ? nil : params[:filter_value]

      @sb[:options][:filter_value] = filter_value
      @sb[:vms] = wizard_get_vms(@sb[:options][:filter_typ], filter_value)
    end

    @sb[:options][:chosen_vm] = params[:chosen_vm] == "<Choose>" ? nil : params[:chosen_vm] if params[:chosen_vm]
    @sb[:options][:days] = params[:trend_days].to_i if params[:trend_days]
    @sb[:options][:vm_mode] = _(VALID_PLANNING_VM_MODES[params[:vm_mode]]) if params[:vm_mode]
    @sb[:options][:trend_cpu] = (params[:trend_cpu] == "1") if params[:trend_cpu]
    @sb[:options][:trend_vcpus] = (params[:trend_vcpus] == "1") if params[:trend_vcpus]
    @sb[:options][:trend_memory] = (params[:trend_memory] == "1") if params[:trend_memory]
    @sb[:options][:trend_storage] = (params[:trend_storage] == "1") if params[:trend_storage]
    @sb[:options][:tz] = params[:planning_tz] if params[:planning_tz]
    if params.key?(:time_profile)
      tp = TimeProfile.find(params[:time_profile]) if params[:time_profile].present?
      @sb[:options][:time_profile] = params[:time_profile].blank? ? nil : params[:time_profile].to_i
      @sb[:options][:time_profile_tz] = params[:time_profile].blank? ? nil : tp.tz
      @sb[:options][:time_profile_days] = params[:time_profile].blank? ? nil : tp.days
    end
    if params[:target_typ]
      @sb[:options][:target_typ] = params[:target_typ]
      @sb[:options][:target_filters] = MiqSearch.where(:id => params[:target_typ]).descriptions
      @sb[:options][:target_filter] = nil
    end
    @sb[:options][:target_filter] = params[:target_filter].presence if params.key?(:target_filter)
    @sb[:options][:limit_cpu] = params[:limit_cpu].to_i if params[:limit_cpu]
    @sb[:options][:limit_vcpus] = params[:limit_vcpus].to_i if params[:limit_vcpus]
    @sb[:options][:limit_memory] = params[:limit_memory].to_i if params[:limit_memory]
    @sb[:options][:limit_storage] = params[:limit_storage].to_i if params[:limit_storage]
    @sb[:options][:display_vms] = params[:display_vms].blank? ? nil : params[:display_vms].to_i if params.key?(:display_vms)

    @sb[:options][:values][:cpu] = params[:trend_cpu_val].to_i if params[:trend_cpu_val]
    @sb[:options][:values][:vcpus] = params[:trend_vcpus_val].to_i if params[:trend_vcpus_val]
    @sb[:options][:values][:memory] = params[:trend_memory_val].to_i if params[:trend_memory_val]
    @sb[:options][:values][:storage] = params[:trend_storage_val].to_i if params[:trend_storage_val]

    fetch_vm_values if params[:chosen_vm] || # Refetch the VM values if any of these options change
                       params[:vm_mode] ||
                       params[:trend_days] ||
                       params[:tz] ||
                       params[:time_profile]

    @sb[:vm_opts] = VimPerformancePlanning.vm_default_options(@sb[:options][:vm_mode])
    if params.key?(:display_vms)
      perf_planning_gen_data
      replace_right_cell
    else
      render :update do |page|
        page << javascript_prologue
        unless %i[trend_cpu_val trend_vcpus_val trend_memory_val trend_storage_val].find { |k| params[k] }
          # Don't replace the div when input fields change
          page.replace("planning_options_div", :partial => "planning_options")
        end
        session[:changed] = @sb[:options][:chosen_vm] || @sb[:options][:vm_mode] == :manual
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
    profile.push("CPU #{@sb[:rpt].extras[:vm_profile][:cpu]}") if @sb[:rpt].extras[:vm_profile][:cpu]
    profile.push("RAM #{@sb[:rpt].extras[:vm_profile][:memory]}") if @sb[:rpt].extras[:vm_profile][:memory]
    profile.push("Disk #{@sb[:rpt].extras[:vm_profile][:storage]}") if @sb[:rpt].extras[:vm_profile][:storage]
    @sb[:rpt].title = _("Counts of VMs (%{profile})") % {:profile => profile.join(", ")}
    filename = "VM Counts per #{ui_lookup(:model => @sb[:options][:target_typ])}"
    disable_client_cache
    download_file(params[:typ], @sb[:rpt], filename)
  end

  def reset
    @explorer = true

    self.x_active_tree = nil
    @sb[:active_tab] = "summary"
    @layout = "miq_capacity_planning"

    @sb = {}

    build_options
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
    @sb[:options] ||= {}
    @sb[:options].reverse_merge!(
      :days => 7, :vm_mode => :allocated, :trend_cpu => true, :trend_vcpus => true,
      :trend_memory => true, :trend_storage => true, :tz => session[:user_tz], :values => {}
    )
    fetch_vm_values
    get_time_profiles # Get time profiles list (global and user specific)

    # Get the time zone from the time profile, if one is in use
    if @sb[:options][:time_profile]
      tp = TimeProfile.find_by(:id => @sb[:options][:time_profile])
      set_time_profile_vars(tp, @sb[:options])
    else
      set_time_profile_vars(selected_time_profile_for_pull_down, @sb[:options])
    end

    @sb[:options].reverse_merge!(
      :target_typ => 'EmsCluster',
      :target_filters => MiqSearch.where(:db => @sb[:options][:target_typ]).descriptions,
      :limit_cpu => 90, :limit_vcpus => 10, :limit_memory => 90, :limit_storage => 90,
      :display_vms => 100
    )

    @sb[:emss] = {}
    find_filtered(ExtManagementSystem).each { |e| @sb[:emss][e.id.to_s] = e.name }
    @sb[:clusters] = {}
    find_filtered(EmsCluster).each { |e| @sb[:clusters][e.id.to_s] = e.name }
    @sb[:hosts] = {}
    find_filtered(Host).each { |e| @sb[:hosts][e.id.to_s] = e.name }
    @sb[:datastores] = {}
    find_filtered(Storage).each { |e| @sb[:datastores][e.id.to_s] = e.name }
    @sb[:vm_filters] = MiqSearch.where(:db => "Vm").descriptions
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
    if @sb[:chart_data] # If planning charts already exist
      @perf_record = MiqEnterprise.first
    end
  end

  # Get the metric values for the selected VM based on the mode
  def fetch_vm_values
    return if @sb[:options][:vm_mode] == :manual
    if @sb[:options][:chosen_vm]
      @sb[:options][:values] = {}
      vm_options = VimPerformancePlanning.vm_default_options(@sb[:options][:vm_mode])
      VimPerformancePlanning.vm_metric_values(Vm.find(@sb[:options][:chosen_vm]),
                                              :vm_options      => vm_options,
                                              :range           => {
                                                :days     => @sb[:options][:days],
                                                :end_date => perf_planning_end_date
                                              },
                                              :tz              => @sb[:options][:tz],
                                              :time_profile_id => @sb[:options][:time_profile])
      vm_options.each do |k, v|
        next if v.nil?
        @sb[:options][:values][k] = if k == :storage
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

    presenter.load_chart(@sb[:chart_data])

    presenter.reload_toolbars(:view => v_tb)
    presenter.set_visibility(@sb[:active_tab] == 'report', :toolbar)

    presenter.update(:main_div, r[:partial => 'planning_tabs'])
    presenter[:replace_cell_text] = if @sb[:options][:target_typ] == 'Host'
                                      _("Best Fit Hosts")
                                    else
                                      _("Best Fit Clusters")
                                    end

    render :json => presenter.for_render
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Optimize")},
        {:title => _("Planning")},
      ],
    }
  end
end
