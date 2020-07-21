class VmOrTemplateController < ApplicationController
  include VmCommon # common methods for vm controllers
  include VmRemote # methods for VM remote access
  include VmShowMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  private

  def features
    [
      {
        :role  => "vms_instances_filter_accord",
        :name  => :vms_instances_filter,
        :title => _("VMs & Instances")
      },
      {
        :role  => "templates_images_filter_accord",
        :name  => :templates_images_filter,
        :title => _("Templates & Images")
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def prefix_by_nodetype(nodetype)
    case TreeBuilder.get_model_for_prefix(nodetype).underscore
    when "miq_template" then "templates_images"
    when "vm"           then "vms_instances"
    end
  end

  def set_elements_and_redirect_unauthorized_user
    @nodetype, = parse_nodetype_and_id(params[:id])
    prefix = prefix_by_nodetype(@nodetype)

    # Position in tree that matches selected record
    if role_allows?(:feature => "#{prefix}_filter_accord")
      set_active_elements_authorized_user("#{prefix}_filter_tree", "#{prefix}_filter")
    else
      redirect_to(:controller => 'dashboard', :action => "auth_error")
      return true
    end
    nodetype, id = params[:id].split("-")
    self.x_node = "#{nodetype}-#{id}"
    get_node_info(x_node)
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
        {:title => _("Services")},
        {:title => _("Workloads")},
      ],
      :include_record => true,
      :x_node         => x_node_right_cell
    }
  end

  menu_section :svc
  has_custom_buttons
  feature_for_actions ['vm_show', 'miq_template_show'], :groups, :users, :patches
end
