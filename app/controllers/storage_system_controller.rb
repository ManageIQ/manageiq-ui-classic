class StorageSystemController < ApplicationController
  include Mixins::GenericListMixin
  # include Mixins::MenuUpdateMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericButtonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def specific_buttons(pressed)
    case pressed
    when 'storage_system_new'
      javascript_redirect(:action => 'new')
    else
      return false
    end
    true
  end

  def new
    assert_privileges("storage_system_new")
    @storage_system = self.class.model.new
    session[:changed] = nil
    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    drop_breadcrumb(:name => _("Add New %{table}") % {:table => ui_lookup(:table => table_name)},
                    :url  => "/#{controller_name}/new")
  end

  def new_storage_system_form_fields
    @storage_system = self.class.model.new if params[:id] == 'new'
    @storage_system = find_record_with_rbac(self.class.model, params[:id]) if params[:id] != 'new'

    render :json => {
      :name => @storage_system.name,
    }
  end

  def create
    assert_privileges("storage_system_new")
    case params[:button]
    when "add" then
      options = form_params_create
      ext_management_system = options.delete(:ems)

      task_id = StorageSystem.create_storage_system_queue(
        session[:userid], ext_management_system, options
      )

      if task_id.kind_of?(Integer)
        flash_to_session(_("Add of %{model} initiated") % {:model => ui_lookup(:model => self.class.model.to_s)})
        javascript_redirect(previous_breadcrumb_url)
      else
        add_flash(_("Storage system creation failed: Task start failed"), :error)
        javascript_flash(:spinner_off => true)
      end

    when "cancel" then
      flash_to_session(_("Add of %{model} was cancelled by the user") % {:model => ui_lookup(:model => self.class.model.to_s)})
      javascript_redirect(:action => @lastaction)
    end
  end

  private

  def form_params_create
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:ems] = ExtManagementSystem.find(params[:ems_id])

    # Depending on the storage manager type, collect required form params.
    case params[:emstype]
    when "ManageIQ::Providers::Autosde::StorageManager"
      options[:password] = params[:password]
      options[:user] = params[:user]
      options[:system_type] = StorageSystemFamily.find(params[:storage_system_family_id]).name
      options[:auto_add_pools] = true
      options[:auto_setup] = true
      options[:management_ip] = params[:management_ip]
      options[:storage_family] = "ontap_7mode"
    end
    options
  end

  def textual_group_list
    [%i[properties]]
  end

  helper_method :textual_group_list

  def get_session_data
    @layout = "storage_system"
  end

  def set_session_data
    session[:layout] = @layout
  end

  menu_section "storage_system"
end
