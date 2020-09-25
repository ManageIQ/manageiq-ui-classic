class PhysicalStorageController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericButtonMixin

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  def specific_buttons(pressed)
    case pressed
    when 'physical_storage_new'
      javascript_redirect(:action => 'new')
    else
      return false
    end
    true
  end

  def new
    assert_privileges("physical_storage_new")
    @physical_storage = self.class.model.new
    session[:changed] = nil
    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    drop_breadcrumb(:name => _("Add New %{table}") % {:table => ui_lookup(:table => table_name)},
                    :url  => "/#{controller_name}/new")
  end

  def new_physical_storage_form_fields
    @physical_storage = self.class.model.new if params[:id] == 'new'
    @physical_storage = find_record_with_rbac(self.class.model, params[:id]) if params[:id] != 'new'

    render :json => {
        :name => @physical_storage.name,
    }
  end

  def create
    assert_privileges("physical_storage_new")
    case params[:button]
    when "add" then
      options = form_params_create
      ext_management_system = options.delete(:ems)

      task_id = PhysicalStorage.create_physical_storage_queue(
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


  def self.table_name
    @table_name ||= "physical_storages"
  end

  def session_data
    @title  = _("Physical Storages")
    @layout = "physical_storage"
    @lastaction = session[:physical_storage_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_storage_lastaction] = @lastaction
  end

  def show_list
    process_show_list
  end

  def textual_group_list
    [
      %i[properties relationships asset_details],
    ]
  end
  helper_method(:textual_group_list)

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Storages"), :url => controller_url},
      ],
    }
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
      options[:system_type] = PhysicalStorageFamily.find(params[:physical_storage_family_id]).name
      options[:auto_add_pools] = true
      options[:auto_setup] = true
      options[:management_ip] = params[:management_ip]
      options[:storage_family] = "ontap_7mode"
    end
    options
  end

end
