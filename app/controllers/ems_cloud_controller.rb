class EmsCloudController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon # common methods for EmsInfra/Cloud controllers
  include Mixins::EmsCommon::Angular
  include Mixins::GenericSessionMixin
  include Mixins::DashboardViewMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  # when methods are evaluated from this constant and return true that means: column is displayed
  DISPLAY_GTL_METHODS = [
    :user_super_admin?
  ].freeze

  def user_super_admin?
    current_user.super_admin_user?
  end

  def self.model
    ManageIQ::Providers::CloudManager
  end

  def self.table_name
    @table_name ||= "ems_cloud"
  end

  def show
    @breadcrumbs = [{:name => _('Cloud Providers'), :url => '/ems_cloud/show_list'}]
    super
  end

  def ems_path(*args)
    ems_cloud_path(*args)
  end

  def new_ems_path
    new_ems_cloud_path
  end

  def ems_cloud_form_fields
    ems_form_fields
  end

  # Special EmsCloud link builder for restful routes
  def show_link(ems, options = {})
    ems_path(ems.id, options)
  end

  def restful?
    true
  end

  menu_section :clo
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  has_custom_buttons

  def sync_users
    assert_privileges('ems_cloud_user_sync')
    ems = find_record_with_rbac(model, params[:id])
    @in_a_form = true
    drop_breadcrumb(:name => _("Sync Users"), :url => "/ems_cloud/sync_users")
    selected_admin_role = params[:admin_role]
    selected_member_role = params[:member_role]
    selected_password = params[:password]
    selected_verify = params[:verify]

    if params[:cancel]
      redirect_to(ems_cloud_path(params[:id]))
      return
    end

    if params[:sync]
      has_error = false
      if selected_password != selected_verify
        add_flash(_("Password/Confirm Password do not match"), :error)
        has_error = true
      end
      if selected_admin_role.blank?
        add_flash(_("An admin role must be selected."), :error)
        has_error = true
      end
      if selected_member_role.blank?
        add_flash(_("A member role must be selected."), :error)
        has_error = true
      end

      if has_error
        render_sync_page(ems, selected_admin_role, selected_member_role, selected_password, selected_verify)
      else
        password_digest = nil
        password_digest = BCrypt::Password.create(selected_password) if selected_password.present?
        ems.sync_users_queue(session[:userid], selected_admin_role, selected_member_role, password_digest)

        flash_to_session(_("Sync users queued."))
        redirect_to(ems_cloud_path(params[:id]))
      end
    else
      render_sync_page(ems, selected_admin_role, selected_member_role, selected_password, selected_verify)
    end
  end

  def render_sync_page(ems, selected_admin_role, selected_member_role, selected_password, selected_verify)
    admin_roles = Rbac::Filterer.filtered(MiqUserRole).pluck(:name, :id).to_h
    member_roles = admin_roles.dup
    admin_roles["Choose Admin Role"] = nil
    member_roles["Choose Member Role"] = nil

    render(:locals => {:selected_admin_role  => selected_admin_role,
                       :selected_member_role => selected_member_role,
                       :selected_password    => selected_password,
                       :selected_verify      => selected_verify,
                       :admin_roles          => admin_roles,
                       :member_roles         => member_roles,
                       :ems                  => ems})
  end

  def download_data
    assert_privileges('ems_cloud_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('ems_cloud_show')
    super
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Providers"), :url => controller_url},
      ],
      :record_info => @ems,
    }.compact
  end
end
