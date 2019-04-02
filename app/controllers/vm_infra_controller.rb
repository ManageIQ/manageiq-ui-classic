class VmInfraController < ApplicationController
  include VmCommon # common methods for vm controllers
  include VmRemote # methods for VM remote access
  include VmShowMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "vm_infra"
  end

  private

  def features
    [
      {
        :role  => "vandt_accord",
        :name  => :vandt,
        :title => _("VMs & Templates")
      },
      {
        :role  => "vms_filter_accord",
        :name  => :vms_filter,
        :title => _("VMs")
      },
      {
        :role  => "templates_filter_accord",
        :name  => :templates_filter,
        :title => _("Templates")
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def prefix_by_nodetype(nodetype)
    case TreeBuilder.get_model_for_prefix(nodetype).underscore
    when "miq_template" then "templates"
    when "vm"           then "vms"
    end
  end

  def set_elements_and_redirect_unauthorized_user
    @nodetype, _id = parse_nodetype_and_id(params[:id])
    prefix = prefix_by_nodetype(@nodetype)

    # Position in tree that matches selected record
    if role_allows?(:feature => "vandt_accord")
      set_active_elements_authorized_user('vandt_tree', 'vandt')
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
        {:title => _("Infrastructure")},
        {:title => _("Virtual Machines")},
      ],
      :include_record => true,
    }
  end

  menu_section :inf
  has_custom_buttons
end
