class AuthKeyPairCloudController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericShowMixin
  include Mixins::GenericListMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin

  def self.display_methods
    %w(instances)
  end

  def show_list
    process_show_list(:dbname => :authkeypaircloud)
  end

  def breadcrumb_name(_model)
    ui_lookup(:tables => "auth_key_pair_cloud")
  end

  def self.table_name
    @table_name ||= "auth_key_pair_cloud"
  end

  def self.model
    ManageIQ::Providers::CloudManager::AuthKeyPair
  end

  # handle buttons pressed on the button bar
  def button
    restore_edit_for_search
    save_current_page_for_refresh

    case params[:pressed]
    when 'auth_key_pair_cloud_tag'
      return tag("ManageIQ::Providers::CloudManager::AuthKeyPair")
    when 'auth_key_pair_cloud_delete'
      handle_delete_button
    when 'auth_key_pair_cloud_new'
      handle_new_button
    else
      if button_replace_gtl_main?
        replace_gtl_main_div
      else
        render_flash
      end
    end
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
    drop_breadcrumb(
      :name => _("Add New %{model}") % {:model => ui_lookup(:table => 'auth_key_pair_cloud')},
      :url  => "/auth_key_pair_cloud/new"
    )
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
      javascript_redirect :action    => 'show_list',
                          :flash_msg => _("Add of new %{model} was cancelled by the user") %
                          {:model => ui_lookup(:table => 'auth_key_pair_cloud')}
    when "save"
      ext_management_system = find_by_id_filtered(ManageIQ::Providers::CloudManager, options[:ems_id])
      kls = kls.class_by_ems(ext_management_system)
      if kls.is_available?(:create_key_pair, ext_management_system, options)
        task_id = kls.create_key_pair_queue(session[:userid], ext_management_system, options)

        if task_id.kind_of?(Integer)
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        else
          add_flash(_("Key Pair creation failed: Task start failed"), :error)
          javascript_flash(:spinner_off => true)
        end
      else
        @in_a_form = true
        add_flash(kls.is_available_now_error_message(:create_key_pair, ext_management_system, kls))
        drop_breadcrumb(
          :name => _("Add New %{model}") % {:model => ui_lookup(:table => 'auth_key_pair_cloud')},
          :url  => "/auth_key_pair_cloud/new"
        )
        javascript_flash
      end
    when "validate"
      @in_a_form = true
      ext_management_system = find_by_id_filtered(ManageIQ::Providers::CloudManager, options[:ems_id])
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

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    session[:flash_msgs] = @flash_array.dup if @flash_array

    javascript_redirect :action => "show_list"
  end

  # delete selected auth key pairs
  def delete_auth_key_pairs
    assert_privileges("auth_key_pair_cloud_delete")
    key_pairs = []

    if @lastaction == "show_list" || (@lastaction == "show" && @layout != "auth_key_pair_cloud")
      key_pairs = find_checked_items
    else
      key_pairs = [params[:id]]
    end

    add_flash(_("No Key Pairs were selected for deletion"), :error) if key_pairs.empty?

    key_pairs_to_delete = []
    key_pairs.each do |k|
      key_pair = ManageIQ::Providers::CloudManager::AuthKeyPair.find_by_id(k)
      if key_pair.nil?
        add_flash(_("%{model} no longer exists.") % {:model => ui_lookup(:table => "auth_key_pair_cloud")}, :error)
      else
        if key_pair.is_available?(:delete_key_pair)
          key_pairs_to_delete.push(k)
        else
          add_flash(_("Couldn't initiate deletion of %{model} \"%{name}\": %{details}") % {
            :model   => ui_lookup(:table => 'auth_key_pair_cloud'),
            :name    => key_pair.name,
            :details => key_pair.is_available_now_error_message(:delete_key_pair)
          }, :error)
        end
      end
    end
    process_deletions(key_pairs_to_delete) unless key_pairs_to_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "auth_key_pair_cloud"
      @single_delete = true unless flash_errors?
      add_flash(_("The selected %{model} was deleted") % {
        :model => ui_lookup(:table => "auth_key_pair_cloud")
      }) if @flash_array.nil?
    end
  end

  def process_deletions(key_pairs)
    return if key_pairs.empty?

    ManageIQ::Providers::CloudManager::AuthKeyPair.where(:id => key_pairs).order('lower(name)').each do |kp|
      audit = {
        :event        => "auth_key_pair_cloud_record_delete_initiateed",
        :message      => "[#{kp.name}] Record delete initiated",
        :target_id    => kp.id,
        :target_class => "ManageIQ::Providers::CloudManager::AuthKeyPair",
        :userid       => session[:userid]
      }
      AuditEvent.success(audit)
      kp.delete_key_pair_queue(session[:userid])
    end
    add_flash(n_("Delete initiated for %{number} Key Pair",
                 "Delete initiated for %{number} Key Pairs", key_pairs.length) % {:number => key_pairs.length})
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  menu_section :clo

  private

  def handle_delete_button
    delete_auth_key_pairs

    if @flash_array.present? && @single_delete
      javascript_redirect :action => 'show_list', :flash_msg => @flash_array[0][:message] # redirect to build the retire screen
    end
  end

  def handle_new_button
    new

    if @flash_array.present?
      show_list
      replace_gtl_main_div
    else
      javascript_redirect :action => "new"
    end
  end
end
