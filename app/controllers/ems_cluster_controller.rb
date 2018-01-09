class EmsClusterController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::MoreShowActions
  include Mixins::GenericShowMixin

  def drift_history
    @display = "drift_history"
    super
  end

  def self.display_methods
    %w(descendant_vms all_vms miq_templates vms hosts resource_pools config_info storage)
  end

  def specific_buttons(pressed)
    case pressed
    when 'common_drift'
      drift_analysis
      return @flash_array.nil?
    #tag(EmsCluster) if params[:pressed] == "ems_cluster_tag"
    when 'ems_cluster_scan'
      scanclusters
    when 'ems_cluster_compare'
      comparemiq
      return @flash_array.nil?
    when 'ems_cluster_delete'
      deleteclusters
    when 'ems_cluster_protect'
      assign_policies(EmsCluster)
      return @flash_array.nil?
    else # we also want to handle the host buttons
      return host_buttons(pressed)
    end
    false
  end

  private

  def textual_group_list
    [
      %i(relationships),
      %i(host_totals vm_totals configuration tags openstack_status)
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

  def get_session_data
    @title      = _("Clusters")
    @layout     = "ems_cluster"
    @lastaction = session[:ems_cluster_lastaction]
    @display    = session[:ems_cluster_display]
    @filters    = session[:ems_cluster_filters]
    @catinfo    = session[:ems_cluster_catinfo]
  end

  def set_session_data
    session[:ems_cluster_lastaction] = @lastaction
    session[:ems_cluster_display]    = @display unless @display.nil?
    session[:ems_cluster_filters]    = @filters
    session[:ems_cluster_catinfo]    = @catinfo
  end

  menu_section :inf
  has_custom_buttons
end
