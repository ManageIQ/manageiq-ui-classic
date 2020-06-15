class AuthKeyPairCloudController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericShowMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericButtonMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::CheckedIdMixin
  include Mixins::Actions::VmActions::Ownership

  def self.display_methods
    %w[instances]
  end

  def show_list
    assert_privileges("auth_key_pair_cloud_show_list")

    process_show_list(:dbname => :authkeypaircloud, :gtl_dbname => :authkeypaircloud)
  end

  def breadcrumb_name(_model)
    _("Key Pairs")
  end

  def self.table_name
    @table_name ||= "auth_key_pair_cloud"
  end

  def self.model
    ManageIQ::Providers::CloudManager::AuthKeyPair
  end

  def specific_buttons(pressed)
    case pressed
    when 'auth_key_pair_cloud_new'
      javascript_redirect(:action => 'new')
      true
    when 'auth_key_pair_ownership'
      @ownershipitems = find_records_with_rbac(ManageIQ::Providers::CloudManager::AuthKeyPair, checked_or_params)
      javascript_redirect(:action => 'ownership', :rec_ids => @ownershipitems.map(&:id))
      true
    end
  end

  def download_private_key
    assert_privileges("auth_key_pair_cloud_download")
    disable_client_cache
    @key_pair = find_record_with_rbac(ManageIQ::Providers::CloudManager::AuthKeyPair, params[:id])
    filename = @key_pair.fingerprint.delete(':', '')
    send_data(@key_pair.auth_key, :filename => "#{filename}.key")
  end

  def set_form_vars
    @edit = {}
    @edit[:auth_key_pair_cloud_id] = @key_pair.id
    @edit[:key] = "auth_key_pair_cloud_edit__#{@key_pair.id || "new"}"
    @edit[:new] = {}

    @edit[:ems_choices] = {}
    ManageIQ::Providers::CloudManager.all.each do |ems|
      @edit[:ems_choices][ems.name] = ems.id if ems.class::AuthKeyPair.is_available?(:create_key_pair, ems)
    end
    @edit[:new][:ems_id] = @edit[:ems_choices].values[0] unless @edit[:ems_choices].empty?

    @edit[:new][:name] = @key_pair.name
    @edit[:current] = @edit[:new].dup
    session[:edit] = @edit
  end

  # REST call for provider choices
  def ems_form_choices
    assert_privileges("auth_key_pair_cloud_new")
    ems_choices = ManageIQ::Providers::CloudManager.select do |ems|
      ems.class::AuthKeyPair.is_available?(:create_key_pair, ems)
    end
    ems_choices.each do |ems|
      {:name => ems.name, :id => ems.id}
    end
    render :json => {:ems_choices => ems_choices}
  end

  def new
    assert_privileges("auth_key_pair_cloud_new")
    @key_pair = ManageIQ::Providers::CloudManager::AuthKeyPair.new
    set_form_vars
    @in_a_form = true
    session[:changed] = nil
    drop_breadcrumb(:name => _("Add New Key Pair"), :url => "/auth_key_pair_cloud/new")
  end

  def create
    assert_privileges("auth_key_pair_cloud_new")

    kls = ManageIQ::Providers::CloudManager::AuthKeyPair
    options = {
      :name       => params[:name],
      :public_key => params[:public_key],
      :ems_id     => params[:ems_id]
    }

    case params[:button]
    when "cancel"
      javascript_redirect(:action    => 'show_list',
                          :flash_msg => _("Add of new Key Pair was cancelled by the user"))
    when "save"
      ext_management_system = find_record_with_rbac(ManageIQ::Providers::CloudManager, options[:ems_id])
      kls = kls.class_by_ems(ext_management_system)
      if kls.is_available?(:create_key_pair, ext_management_system, options)
        task_id = kls.create_key_pair_queue(session[:userid], ext_management_system, options)

        unless task_id.kind_of?(Integer)
          add_flash(_("Key Pair creation failed: Task start failed"), :error)
        end
        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        end
      else
        @in_a_form = true
        add_flash(kls.is_available_now_error_message(:create_key_pair, ext_management_system, kls))
        drop_breadcrumb(
          :name => _("Add New Key Pair"),
          :url  => "/auth_key_pair_cloud/new"
        )
        javascript_flash
      end
    when "validate"
      @in_a_form = true
      ext_management_system = find_record_with_rbac(ManageIQ::Providers::CloudManager, options[:ems_id])
      kls = kls.class_by_ems(ext_management_system)
      if kls.is_available?(:create_key_pair, ext_management_system, options)
        add_flash(_("Validation successful"))
      else
        add_flash(kls.is_available_now_error_message(:create_key_pair, ext_management_system, options))
      end
      javascript_flash
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    key_pair_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Key Pair \"%{name}\" created") % {
        :name => key_pair_name
      })
    else
      add_flash(_("Unable to create Key Pair \"%{name}\": %{details}") % {
        :name    => key_pair_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show_list")
  end

  private

  def textual_group_list
    [%i[properties relationships lifecycle], %i[tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Key Pairs"), :url => controller_url},
      ],
    }
  end

  menu_section :clo
end
