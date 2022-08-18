class VmCloudController < ApplicationController
  include VmCommon # common methods for vm controllers
  include VmRemote # methods for VM remote access
  include VmShowMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "vm_cloud"
  end

  def index
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def attach
    assert_privileges("instance_attach")
    @volume_choices = {}
    @record = @vm = find_record_with_rbac(VmCloud, params[:id])
    @vm.cloud_tenant.cloud_volumes.where(:status => 'available').each { |v| @volume_choices[v.name] = v.id }

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Attach Cloud Volume to Instance \"%{instance_name}\"") % {:instance_name => @vm.name},
      :url  => "/vm_cloud/attach"
    )
    @in_a_form = true
    @refresh_partial = "vm_common/attach"
  end
  alias instance_attach attach

  def detach
    assert_privileges("instance_detach")
    @volume_choices = {}
    @record = @vm = find_record_with_rbac(VmCloud, params[:id])
    attached_volumes = @vm.hardware.disks.select(&:backing).map(&:backing)
    attached_volumes.each { |volume| @volume_choices[volume.name] = volume.id }
    if attached_volumes.empty?
      add_flash(_("Instance \"%{instance_name}\" has no attached Cloud Volumes") % {:instance_name => @vm.name})
      javascript_flash
    end

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Detach Cloud Volume from Instance \"%{instance_name}\"") % {:instance_name => @vm.name},
      :url  => "/vm_cloud/detach"
    )
    @in_a_form = true
    @refresh_partial = "vm_common/detach"
  end
  alias instance_detach detach

  def attach_volume
    assert_privileges("instance_attach")
    @vm = find_record_with_rbac(VmCloud, params[:id])
  end

  def detach_volume
    assert_privileges("instance_detach")
    @vm = find_record_with_rbac(VmCloud, params[:id])
  end

  def flash_and_redirect(message)
    session[:edit] = nil
    add_flash(message)
    @record = @sb[:action] = nil
    replace_right_cell
  end

  private

  def textual_group_list
    [
      %i[properties lifecycle] +
        (@record.kind_of?(VmCloud) ? %i[vm_cloud_relationships] : %i[template_cloud_relationships]) +
        %i[vmsafe miq_custom_attributes ems_custom_attributes labels],
      %i[compliance power_management security configuration diagnostics tags]
    ]
  end
  helper_method :textual_group_list

  def features
    [
      {
        :role  => "instances_accord",
        :name  => :instances,
        :title => _("Instances by Provider")
      },
      {
        :role  => "images_accord",
        :name  => :images,
        :title => _("Images by Provider")
      },
      {
        :role  => "instances_filter_accord",
        :name  => :instances_filter,
        :title => _("Instances")
      },
      {
        :role  => "images_filter_accord",
        :name  => :images_filter,
        :title => _("Images")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  # redefine get_filters from VmShow
  def get_filters
    session[:instances_filters]
  end

  def prefix_by_nodetype(nodetype)
    case TreeBuilder.get_model_for_prefix(nodetype).underscore
    when "miq_template" then "images"
    when "vm"           then "instances"
    end
  end

  def set_elements_and_redirect_unauthorized_user
    @nodetype, _id = parse_nodetype_and_id(params[:id])
    prefix = prefix_by_nodetype(@nodetype)

    # Position in tree that matches selected record
    if role_allows?(:feature => "instances_accord") && prefix == "instances"
      set_active_elements_authorized_user('instances_tree', 'instances')
    elsif role_allows?(:feature => "images_accord") && prefix == "images"
      set_active_elements_authorized_user('images_tree', 'images')
    elsif role_allows?(:feature => "#{prefix}_filter_accord")
      set_active_elements_authorized_user("#{prefix}_filter_tree", "#{prefix}_filter")
    else
      if (prefix == "vms" && role_allows?(:feature => "vms_instances_filter_accord")) ||
         (prefix == "templates" && role_allows?(:feature => "templates_images_filter_accord"))
        redirect_to(:controller => 'vm_or_template', :action => "explorer", :id => params[:id])
      else
        redirect_to(:controller => 'dashboard', :action => "auth_error")
      end
      return true
    end

    resolve_node_info(params[:id])
  end

  def tagging_explorer_controller?
    @explorer
  end

  def skip_breadcrumb?
    breadcrumb_prohibited_for_action?
  end

  def breadcrumbs_options
    {
      :breadcrumbs    => [
        {:title => _("Compute")},
        {:title => _("Cloud")},
        {:title => _("Instances")},
      ],
      :include_record => true,
      :x_node         => x_node_right_cell
    }
  end

  menu_section :clo
  feature_for_actions %w[instances_filter_accord images_filter_accord], *ADV_SEARCH_ACTIONS
  feature_for_actions 'vm_show', :groups, :users, :patches
  feature_for_actions ['instance_protect', 'image_protect'], :protect
  feature_for_actions ['instance_timeline', 'image_timeline'], :tl_chooser
  feature_for_actions ['instance_perf', 'image_perf'], :perf_top_chart
  has_custom_buttons
end
