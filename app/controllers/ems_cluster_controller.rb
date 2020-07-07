class EmsClusterController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::MoreShowActions
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def title
    @title = _("Clusters")
  end

  def drift_history
    @display = "drift_history"
    super
  end

  def self.display_methods
    %w[all_vms miq_templates vms hosts resource_pools config_info storage custom_button_events]
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[all_vms vms hosts resource_pools].include?(@display) # Were we displaying sub-items

    if params[:pressed].starts_with?("vm_", # Handle buttons from sub-items screen
                                     "miq_template_",
                                     "guest_",
                                     "host_",
                                     "rp_")

      scanhosts if params[:pressed] == "host_scan"
      analyze_check_compliance_hosts if params[:pressed] == "host_analyze_check_compliance"
      check_compliance_hosts if params[:pressed] == "host_check_compliance"
      refreshhosts if params[:pressed] == "host_refresh"
      tag(Host) if params[:pressed] == "host_tag"
      assign_policies(Host) if params[:pressed] == "host_protect"
      comparemiq if params[:pressed] == "host_compare"
      edit_record if params[:pressed] == "host_edit"
      deletehosts if params[:pressed] == "host_delete"

      tag(ResourcePool) if params[:pressed] == "rp_tag"

      pfx = pfx_for_vm_button_pressed(params[:pressed])
      # Handle Host power buttons
      if host_power_button?(params[:pressed])
        handle_host_power_button(params[:pressed])
      else
        process_vm_buttons(pfx)
        return if ["host_tag", "#{pfx}_policy_sim", "host_scan", "host_refresh", "host_protect",
                   "host_compare", "#{pfx}_compare", "#{pfx}_drift", "#{pfx}_tag", "#{pfx}_retire",
                   "#{pfx}_protect", "#{pfx}_ownership", "#{pfx}_right_size",
                   "#{pfx}_reconfigure", "rp_tag"].include?(params[:pressed]) &&
                  @flash_array.nil? # Some other screen is showing, so return

        unless ["host_edit", "#{pfx}_edit", "#{pfx}_miq_request_new", "#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish", 'vm_rename'].include?(params[:pressed])
          @refresh_div = "main_div"
          @refresh_partial = "layouts/gtl"
          show
        end
      end
    else
      @refresh_div = "main_div" # Default div for button.rjs to refresh
      drift_analysis if params[:pressed] == "common_drift"
      tag(EmsCluster) if params[:pressed] == "ems_cluster_tag"
      scanclusters if params[:pressed] == "ems_cluster_scan"
      comparemiq if params[:pressed] == "ems_cluster_compare"
      deleteclusters if params[:pressed] == "ems_cluster_delete"
      assign_policies(EmsCluster) if params[:pressed] == "ems_cluster_protect"
      custom_buttons if params[:pressed] == "custom_button"
    end

    return if ["custom_button"].include?(params[:pressed]) # custom button screen, so return, let custom_buttons method handle everything
    return if %w[ems_cluster_tag ems_cluster_compare common_drift ems_cluster_protect].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing, so return

    check_if_button_is_implemented

    if single_delete_test
      single_delete_redirect
    elsif params[:pressed].ends_with?("_edit") ||
          ["#{pfx}_miq_request_new", "#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed]) ||
          params[:pressed] == 'vm_rename' && @flash_array.nil?
      render_or_redirect_partial(pfx)
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
    end
  end

  private

  def textual_group_list
    [
      %i[relationships],
      %i[host_totals vm_totals configuration tags openstack_status]
    ]
  end
  helper_method :textual_group_list

  def breadcrumb_name(_model)
    title_for_clusters
  end

  def set_config(db_record)
    @cluster_config = []
    @cluster_config.push(:field       => "HA Enabled",
                         :description => db_record.ha_enabled) unless db_record.ha_enabled.nil?
    @cluster_config.push(:field       => "HA Admit Control",
                         :description => db_record.ha_admit_control) unless db_record.ha_admit_control.nil?
    @cluster_config.push(:field       => "DRS Enabled",
                         :description => db_record.drs_enabled) unless db_record.drs_enabled.nil?
    @cluster_config.push(:field       => "DRS Automation Level",
                         :description => db_record.drs_automation_level) unless db_record.drs_automation_level.nil?
    @cluster_config.push(:field       => "DRS Migration Threshold",
                         :description => db_record.drs_migration_threshold) unless db_record.drs_migration_threshold.nil?
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => title_for_clusters, :url => controller_url},
      ],
      :record_info => @ems,
    }.compact
  end

  menu_section :inf
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  has_custom_buttons
end
