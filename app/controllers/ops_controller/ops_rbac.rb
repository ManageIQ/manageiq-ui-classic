# Access Control Accordion methods included in OpsController.rb
module OpsController::OpsRbac
  extend ActiveSupport::Concern

  TAG_DB_TO_NAME = {
    'MiqGroup' => 'group',
    'User'     => 'user',
    'Tenant'   => 'tenant'
  }.freeze

  def role_allows?(**options)
    if MiqProductFeature.my_root_tenant_identifier?(options[:feature]) && params.key?(:id)
      if params[:id].to_s.include?('tn')
        _, id, _ = TreeBuilder.extract_node_model_and_id(params[:id].to_s)
      else
        id = params[:id].to_s
      end

      options[:feature] = MiqProductFeature.tenant_identifier(options[:feature], id)
    end

    super(options)
  end

  def invalidate_miq_product_feature_caches
    MiqProductFeature.invalidate_caches
    render :json => {}
  end

  # Edit user or group tags
  def rbac_tags_edit
    case params[:button]
    when "cancel"
      rbac_edit_tags_cancel
    when "save", "add"
      assert_privileges("rbac_#{TAG_DB_TO_NAME[session[:tag_db]]}_tags_edit")
      rbac_edit_tags_save
    when "reset", nil # Reset or first time in
      nodes = x_node.split('-')
      tagging = if nodes.first == "g" || nodes.last == "g"
                  'MiqGroup'
                elsif nodes.first == "u" || nodes.last == "u"
                  'User'
                elsif nodes.first == "tn" || nodes.last == "tn"
                  'Tenant'
                else
                  params[:tagging]
                end
      rbac_edit_tags_reset(tagging)
    end
  end

  def rbac_user_add
    assert_privileges("rbac_user_add")
    rbac_edit_reset('new', 'user', User)
  end

  def rbac_user_copy
    # get users id either from gtl check or detail id
    user_id = params[:miq_grid_checks].presence || params[:id]
    user = User.find(user_id)
    # check if it is allowed to copy the user
    if rbac_user_copy_restriction?(user)
      rbac_restricted_user_copy_flash(user)
    end
    if @flash_array
      javascript_flash
      return
    end
    assert_privileges("rbac_user_copy")
    rbac_edit_reset('copy', 'user', User)
  end

  def rbac_user_edit
    assert_privileges("rbac_user_edit")
    case params[:button]
    when 'cancel'      then rbac_edit_cancel('user')
    when 'save', 'add' then rbac_edit_save_or_add('user')
    when 'reset', nil  then rbac_edit_reset(params[:typ], 'user', User) # Reset or first time in
    end
  end

  def rbac_group_add
    assert_privileges("rbac_group_add")
    rbac_edit_reset('new', 'group', MiqGroup)
  end

  def rbac_group_edit
    assert_privileges("rbac_group_edit")
    case params[:button]
    when 'cancel'            then rbac_edit_cancel('group')
    when 'save', 'add'       then rbac_edit_save_or_add('group')
    when 'reset', nil        then rbac_edit_reset(params[:typ], 'group', MiqGroup) # Reset or first time in
    end
  end

  def rbac_role_add
    assert_privileges("rbac_role_add")
    rbac_edit_reset('new', 'role', MiqUserRole)
  end

  def rbac_role_copy
    assert_privileges("rbac_role_copy")
    rbac_edit_reset('copy', 'role', MiqUserRole)
  end

  def rbac_role_edit
    assert_privileges("rbac_role_edit")
    case params[:button]
    when 'cancel'      then rbac_edit_cancel('role')
    when 'save', 'add' then rbac_edit_save_or_add('role', 'miq_user_role')
    when 'reset', nil  then rbac_edit_reset(params[:typ], 'role', MiqUserRole) # Reset or form load
    end
  end

  def rbac_tenant_add
    assert_privileges("rbac_tenant_add")
    @_params[:typ] = "new"
    @tenant_type = params[:tenant_type] == "tenant"
    @tenant_parent = Tenant.find(x_node.split('-').last).id
    rbac_tenant_edit
  end
  alias_method :rbac_project_add, :rbac_tenant_add

  def rbac_tenant_edit_reset
    @tenant = params[:typ] == "new" ? Tenant.new : find_record_with_rbac(Tenant, checked_or_params)

    # This is only because ops_controller tries to set form locals, otherwise we should not use the @edit variable
    @edit = {:tenant_id => @tenant.id}

    # This is a hack to trick the controller into thinking we loaded an edit variable
    session[:edit] = {:key => "tenant_edit__#{@tenant.id || 'new'}"}

    session[:changed] = false

    replace_right_cell(:nodetype => "tenant_edit")
  end

  def rbac_tenant_edit
    assert_privileges("rbac_tenant_edit")
    rbac_tenant_edit_reset
  end

  def rbac_tenant_manage_quotas_cancel
    @tenant = Tenant.find(params[:id])
    add_flash(_("Manage quotas for %{model}\ \"%{name}\" was cancelled by the user") %
                  {:model => tenant_type_title_string(@tenant.divisible), :name => @tenant.name})
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node)
  end

  def rbac_tenant_manage_quotas_save_add
    tenant = Tenant.find(params[:id])
    begin
      if !params[:quotas]
        tenant.set_quotas({})
      else
        tenant.set_quotas(params.require(:quotas).permit!.to_h.deep_symbolize_keys)
      end
    rescue => bang
      add_flash(_("Error when saving tenant quota: %{message}") % {:message => bang.message}, :error)
      javascript_flash
    else
      add_flash(_("Quotas for %{model} \"%{name}\" were saved") %
                    {:model => tenant_type_title_string(tenant.divisible), :name => tenant.name})
      get_node_info(x_node)
      replace_right_cell(:nodetype => "root", :replace_trees => [:rbac])
    end
  end

  def rbac_tenant_manage_quotas_reset
    @tenant = find_record_with_rbac(Tenant, checked_or_params)
    # This is only because ops_controller tries to set form locals, otherwise we should not use the @edit variable
    @edit = {:tenant_id => @tenant.id}
    session[:edit] = {:key => "tenant_manage_quotas__#{@tenant.id}"}
    session[:changed] = false
    add_flash(_("All changes have been reset"), :warning) if params[:button] == 'reset'
    replace_right_cell(:nodetype => "tenant_manage_quotas")
  end

  def rbac_tenant_manage_quotas
    assert_privileges("rbac_tenant_manage_quotas")
    case params[:button]
    when "cancel"
      rbac_tenant_manage_quotas_cancel
    when "save", "add"
      rbac_tenant_manage_quotas_save_add
    when "reset", nil # Reset or first time in
      rbac_tenant_manage_quotas_reset
    end
  end

  def tenant_quotas_form_fields
    tenant = Tenant.find(params[:id])
    tenant_quotas = tenant.get_quotas
    render :json => {
      :name   => tenant.name,
      :quotas => tenant_quotas
    }
  end

  # Edit user or group tags
  def rbac_tenant_tags_edit
    case params[:button]
    when "cancel"
      rbac_edit_tags_cancel
    when "save", "add"
      assert_privileges("rbac_tenant_tags_edit")
      rbac_edit_tags_save
    when "reset", nil # Reset or first time in
      rbac_edit_tags_reset('Tenant')
    end
  end

  # AJAX driven routines to check for changes in ANY field on the form
  def rbac_user_field_changed
    rbac_field_changed("user")
  end

  def rbac_group_field_changed
    rbac_field_changed("group")
  end

  def rbac_role_field_changed
    rbac_field_changed("role")
  end

  def rbac_user_delete
    assert_privileges("rbac_user_delete")
    users = []
    if params[:id] # showing a list
      if params[:id].nil? || !User.exists?(params[:id])
        add_flash(_("User no longer exists"), :error)
      else
        user = User.find(params[:id])
        if rbac_user_delete_restriction?(user)
          rbac_restricted_user_delete_flash(user)
        else
          users.push(params[:id])
        end
      end
      if @flash_array
        javascript_flash
        return
      end
      process_users(users, "destroy") unless users.empty?
      self.x_node = "xx-u" # reset node to show list
    else # showing 1 user, delete it
      ids = find_checked_items.collect { |r| r.to_s.split("-").last }
      users = User.where(:id => ids).compact
      if users.empty?
        add_flash(_("Default EVM User \"Administrator\" cannot be deleted"), :error)
        javascript_flash
        return
      else
        restricted_users = []
        users.each do |u|
          user = User.find(u)
          restricted_users.push(user) if rbac_user_delete_restriction?(user)
        end
        # deleting elements in temporary array, had to create temp array to hold id's to be delete, .each gets confused if i deleted them in above loop
        restricted_users.each do |u|
          rbac_restricted_user_delete_flash(u)
          users.delete(u)
        end
      end
      process_users(users, "destroy") unless users.empty?
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node, :replace_trees => [:rbac])
  end

  def rbac_role_delete
    assert_privileges("rbac_role_delete")
    roles = []
    if !params[:id] # showing a role list
      ids = find_checked_items.collect { |r| r.to_s.split("-").last }
      roles = MiqUserRole.where(:id => ids)
      process_roles(roles, "destroy") unless roles.empty?
    else # showing 1 role, delete it
      roles.push(params[:id])
      process_roles(roles, "destroy") unless roles.empty?
      self.x_node = "xx-ur" unless MiqUserRole.exists?(params[:id]) # reset node to show list
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node, :replace_trees => [:rbac])
  end

  # Show the main Users/Groups/Roles list view
  def rbac_users_list
    rbac_list("user")
  end

  def rbac_groups_list
    rbac_list("group")
  end

  def rbac_roles_list
    rbac_list("role")
  end

  def rbac_tenants_list
    rbac_list("tenant")
  end

  def rbac_tenant_delete
    assert_privileges("rbac_tenant_delete")
    tenants = []
    if !params[:id] # showing a tenants list
      tenants = Tenant.where(:id => find_checked_items).reject do |t|
        add_flash(_("Default Tenant \"%{name}\" can not be deleted") % {:name => t.name}, :error) if t.parent.nil?
        t.parent.nil?
      end
    else # showing 1 tenant, delete it
      tenants.push(params[:id])
      parent_id = Tenant.find(params[:id]).parent.id
      self.x_node = "tn-#{parent_id}"
    end

    unless tenants.empty?
      process_tenants(tenants, "destroy")
      MiqProductFeature.invalidate_caches
    end

    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node, :replace_trees => [:rbac])
  end

  def rbac_group_delete
    assert_privileges("rbac_group_delete")
    groups = []
    if !params[:id] # showing a list
      ids = find_checked_items.collect { |r| r.to_s.split("-").last }
      groups = MiqGroup.where(:id => ids)
      process_groups(groups, "destroy") unless groups.empty?
      self.x_node = "xx-g" # reset node to show list
    else # showing 1 group, delete it
      groups.push(params[:id])
      process_groups(groups, "destroy") unless groups.empty?
      self.x_node = "xx-g" unless MiqGroup.exists?(params[:id]) # reset node to show list
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node, :replace_trees => [:rbac])
  end

  def rbac_group_seq_edit
    assert_privileges("rbac_group_seq_edit")
    case params[:button]
    when "cancel"
      @edit = nil
      add_flash(_("Edit Sequence of User Groups was cancelled by the user"))
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node)
    when "save"
      return unless load_edit("rbac_group_edit__seq", "replace_cell__explorer")
      err = false
      @edit[:new][:ldap_groups_list].each_with_index do |grp, i|
        group = MiqGroup.find_by(:description => grp)
        group.sequence = i + 1
        if group.save
          AuditEvent.success(build_saved_audit(group, params[:button] == "add"))
        else
          group.errors.each do |field, msg|
            add_flash("#{field.to_s.capitalize} #{msg}", :error)
          end
          err = true
        end
      end
      if !err
        add_flash(_("User Group Sequence was saved"))
        @_in_a_form = false
        @edit = session[:edit] = nil # clean out the saved info
        get_node_info(x_node)
        replace_right_cell(:nodetype => x_node)
      else
        drop_breadcrumb(:name => _("Edit User Group Sequence"), :url => "/configuration/ldap_seq_edit")
        @in_a_form = true
        replace_right_cell(:nodetype => "group_seq")
      end
    when "reset", nil # Reset or first time in
      rbac_group_seq_edit_screen
      @in_a_form = true
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "group_seq")
    end
  end

  def rbac_group_seq_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:new][:ldap_groups] = MiqGroup.non_tenant_groups.sort_by(&:sequence) # Get the non-tenant groups from the DB
    @edit[:new][:ldap_groups_list] = []
    @edit[:new][:ldap_groups].each do |g|
      @edit[:new][:ldap_groups_list].push(g.description)
    end
    @edit[:key] = "rbac_group_edit__seq"
    @edit[:current] = copy_hash(@edit[:new])

    @right_cell_text = _("Editing Sequence of User Groups")

    session[:edit] = @edit
    session[:changed] = false
  end

  def move_cols_up
    return unless load_edit("rbac_group_edit__seq", "replace_cell__explorer")
    if params[:seq_fields].blank? || params[:seq_fields][0] == ""
      add_flash(_("No fields were selected to move up"), :error)
      return
    end
    consecutive, first_idx, last_idx = selected_consecutive?
    if !consecutive
      add_flash(_("Select only one or consecutive fields to move up"), :error)
    else
      if first_idx.positive?
        @edit[:new][:ldap_groups_list][first_idx..last_idx].reverse_each do |field|
          pulled = @edit[:new][:ldap_groups_list].delete(field)
          @edit[:new][:ldap_groups_list].insert(first_idx - 1, pulled)
        end
      end
      @refresh_div = "column_lists"
      @refresh_partial = "ldap_seq_form"
    end
    @selected = params[:seq_fields]
  end

  def move_cols_down
    return unless load_edit("rbac_group_edit__seq", "replace_cell__explorer")
    if params[:seq_fields].blank? || params[:seq_fields][0] == ""
      add_flash(_("No fields were selected to move down"), :error)
      return
    end
    consecutive, first_idx, last_idx = selected_consecutive?
    if !consecutive
      add_flash(_("Select only one or consecutive fields to move down"), :error)
    else
      if last_idx < @edit[:new][:ldap_groups_list].length - 1
        insert_idx = last_idx + 1 # Insert before the element after the last one
        insert_idx = -1 if last_idx == @edit[:new][:ldap_groups_list].length - 2 # Insert at end if 1 away from end
        @edit[:new][:ldap_groups_list][first_idx..last_idx].each do |field|
          pulled = @edit[:new][:ldap_groups_list].delete(field)
          @edit[:new][:ldap_groups_list].insert(insert_idx, pulled)
        end
      end
      @refresh_div = "column_lists"
      @refresh_partial = "ldap_seq_form"
    end
    @selected = params[:seq_fields]
  end

  def selected_consecutive?
    first_idx = last_idx = 0
    @edit[:new][:ldap_groups_list].each_with_index do |nf, idx|
      first_idx = idx if nf == params[:seq_fields].first
      if nf == params[:seq_fields].last
        last_idx = idx
        break
      end
    end
    consecutime = last_idx - first_idx + 1 <= params[:seq_fields].length
    [consecutime, first_idx, last_idx]
  end

  def rbac_group_user_lookup_field_changed
    return unless load_edit("rbac_group_edit__#{params[:id]}", "replace_cell__explorer")
    @edit[:new][:user]     = params[:user]     if params[:user]
    @edit[:new][:user_id]  = params[:user_id]  if params[:user_id]
    @edit[:new][:user_pwd] = params[:password] if params[:password]
  end

  def rbac_group_user_lookup
    rbac_group_user_lookup_field_changed
    add_flash(_("User must be entered to perform LDAP Group Look Up"), :error) if @edit[:new][:user].blank?

    if ::Settings.authentication.mode != "httpd"
      add_flash(_("Username must be entered to perform LDAP Group Look Up"), :error) if @edit[:new][:user_id].blank?
      add_flash(_("User Password must be entered to perform LDAP Group Look Up"), :error) if @edit[:new][:user_pwd].blank?
    end

    unless @flash_array.nil?
      javascript_flash
      return
    end

    @record = MiqGroup.find_by(:id => @edit[:group_id])
    @sb[:roles] = @edit[:roles]
    begin
      @edit[:ldap_groups_by_user] = if ::Settings.authentication.mode == "httpd"
                                      MiqGroup.get_httpd_groups_by_user(@edit[:new][:user])
                                    else
                                      MiqGroup.get_ldap_groups_by_user(@edit[:new][:user],
                                                                       @edit[:new][:user_id],
                                                                       @edit[:new][:user_pwd])
                                    end
    rescue => bang
      @edit[:ldap_groups_by_user] = []
      add_flash(_("Error during 'LDAP Group Look Up': %{message}") % {:message => bang.message}, :error)
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page.replace("ldap_user_div", :partial => "ldap_auth_users")
      end
    else
      render :update do |page|
        page << javascript_prologue
        page.replace("ldap_user_div", :partial => "ldap_auth_users")
      end
    end
  end

  private ############################

  def tenant_type_title_string(divisible)
    divisible ? _("Tenant") : _("Project")
  end

  # super administrator user with `userid` == "admin" can not be deleted
  # and user can not delete himself
  def rbac_user_delete_restriction?(user)
    user.admin? || User.current_user == user
  end

  def rbac_user_copy_restriction?(user)
    user.super_admin_user?
  end

  def rbac_restricted_user_delete_flash(user)
    msg = if user.super_admin_user?
            _("Default EVM User \"%{name}\" cannot be deleted")
          else
            _("Current EVM User \"%{name}\" cannot be deleted")
          end
    add_flash(msg % {:name => user.name}, :error)
  end

  def rbac_restricted_user_copy_flash(user)
    add_flash(_("Default EVM User \"%{name}\" cannot be copied") % {:name => user.name}, :error)
  end

  def rbac_edit_tags_reset(tagging)
    @object_ids = find_records_with_rbac(tagging.constantize, checked_or_params).ids
    if params[:button] == "reset"
      id = params[:id] if params[:id]
      return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}", "replace_cell__explorer")
      @object_ids = @edit[:object_ids]
      session[:tag_db] = @tagging = @edit[:tagging]
    else
      @object_ids[0] = params[:id] if @object_ids.blank? && params[:id]
      session[:tag_db] = @tagging = tagging
    end

    @gtl_type = "list" # No quad icons for user/group list views
    x_tags_set_form_vars
    @in_a_form = true
    session[:changed] = false
    add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"
    @sb[:pre_edit_node] = x_node  unless params[:button] # Save active tree node before edit
    @right_cell_text = _("Editing %{model} for \"%{name}\"") % {:name => ui_lookup(:models => @tagging), :model => "#{current_tenant.name} Tags"}
    replace_right_cell(:nodetype => "root")
  end

  def rbac_edit_tags_cancel
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}", "replace_cell__explorer")
    add_flash(_("Tag Edit was cancelled by the user"))
    self.x_node = @sb[:pre_edit_node]
    get_node_info(x_node)
    @edit = nil # clean out the saved info
    replace_right_cell(:nodetype => @nodetype)
  end

  def rbac_edit_tags_save
    tagging_edit_tags_save_and_replace_right_cell
  end

  def rbac_edit_cancel(what)
    key = what.to_sym
    id = params[:id] ? params[:id] : "new"
    return unless load_edit("rbac_#{what}_edit__#{id}", "replace_cell__explorer")
    case key
    when :role
      record_id = @edit[:role_id]
    when :group
      record_id = @edit[:group_id]
    when :user
      record_id = @edit[:user_id]
    when :tenant
      record_id = id
    end
    add_flash(if record_id
                _("Edit of %{name} was cancelled by the user") % {:name => what.titleize}
              else
                _("Add of new %{name} was cancelled by the user") % {:name => what.titleize}
              end)
    self.x_node = @sb[:pre_edit_node]
    get_node_info(x_node)
    @edit = nil # clean out the saved info
    replace_right_cell(:nodetype => @nodetype)
  end

  def rbac_edit_reset(operation, what, klass)
    key = what.to_sym
    if operation != "new"
      record = find_record_with_rbac(klass, checked_or_params)
      if %i[group role].include?(key) && record && record.read_only && operation != 'copy'
        model, name = if key == :role
                        [_('Role'), record.name]
                      else
                        [_('EVM Group'), record.description]
                      end
        add_flash(_("Read Only %{model} \"%{name}\" can not be edited") % {:model => model, :name => name }, :warning)
        javascript_flash
        return
      end
    end

    case operation
    when "new"
      # create new record
      @record = klass.new
      if key == :role
        @record.miq_product_features = [MiqProductFeature.find_by(:identifier => MiqProductFeature.feature_root)]
      end
    when "copy"
      # copy existing record
      @record = record.clone
      case key
      when :user
        @record.current_group = record.current_group
      when :group
        @record.miq_user_role = record.miq_user_role
      when :role
        @record.miq_product_features = record.miq_product_features
        @record.read_only = false
      end
    else
      # use existing record
      @record = record
    end
    @sb[:typ] = operation

    # set form fields according to what is copied
    case key
    when :user  then rbac_user_set_form_vars
    when :group then rbac_group_set_form_vars
    when :role  then rbac_role_set_form_vars
    end

    @in_a_form = true
    session[:changed] = key == :group ? @deleted_belongsto_filters.present? : false
    add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"
    @sb[:pre_edit_node] = x_node  unless params[:button] # Save active tree node before edit
    replace_right_cell(:nodetype => x_node)
  end

  def rbac_edit_save_or_add(what, rbac_suffix = what)
    key         = what.to_sym
    id          = params[:id] || "new"
    add_pressed = params[:button] == "add"

    return unless load_edit("rbac_#{what}_edit__#{id}", "replace_cell__explorer")

    case key
    when :user
      record = @edit[:user_id] ? User.find_by(:id => @edit[:user_id]) : User.new
      validated = rbac_user_validate?
      rbac_user_set_record_vars(record)
    when :group then
      record = @edit[:group_id] ? MiqGroup.find_by(:id => @edit[:group_id]) : MiqGroup.new
      validated = rbac_group_validate?
      rbac_group_set_record_vars(record) if validated
    when :role  then
      record = @edit[:role_id] ? MiqUserRole.find_by(:id => @edit[:role_id]) : MiqUserRole.new
      validated = rbac_role_validate?
      rbac_role_set_record_vars(record)
    end

    if record.valid? && validated && record.save!
      record.update_attributes!(:miq_groups => Rbac.filtered(MiqGroup.where(:id => rbac_user_get_group_ids))) if key == :user # only set miq_groups if everything is valid
      populate_role_features(record) if what == "role"
      self.current_user = record if what == 'user' && @edit[:current][:userid] == current_userid
      AuditEvent.success(build_saved_audit(record, add_pressed))
      subkey = key == :group ? :description : :name
      add_flash(_("%{model} \"%{name}\" was saved") % {:model => what.titleize, :name => @edit[:new][subkey]})
      add_flash(_("Outdated filters were removed from group \"%{name}\"") % {:name => @edit[:new][subkey]}) if what == "group" && @edit[:current][:deleted_belongsto_filters].present?
      @edit = session[:edit] = nil # clean out the saved info
      if add_pressed
        suffix = case rbac_suffix
                 when "group"         then "g"
                 when "miq_user_role" then "ur"
                 when "user"          then "u"
                 end
        self.x_node = "xx-#{suffix}" # reset node to show list
        send("rbac_#{what.pluralize}_list")
      end
      # Get selected Node
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:rbac])
      return
    end

    @changed = session[:changed] = (@edit[:new] != @edit[:current])
    record.errors.each { |field, msg| add_flash("#{field.to_s.capitalize} #{msg}", :error) }

    render_flash
  end

  # Show the main Users/Gropus/Roles list views
  def rbac_list(rec_type)
    rbac_build_list(rec_type)
    update_gtl_div("rbac_#{rec_type.pluralize}_list") if pagination_or_gtl_request? && @show_list
  end

  # Create the view and associated vars for the rbac list
  def rbac_build_list(rec_type)
    @lastaction = "rbac_#{rec_type}s_list"
    @force_no_grid_xml = true
    @gtl_type = "list"
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session["rbac_#{rec_type}_sortcol"].nil? ? 0 : @sb["rbac_#{rec_type}_sortcol"].to_i
    @sortdir = session["rbac_#{rec_type}_sortdir"].nil? ? "ASC" : @sb["rbac_#{rec_type}_sortdir"]

    # Get the records (into a view) and the paginator
    @view, @pages = case rec_type
                    when "user"
                      get_view(User, :named_scope => :in_my_region)
                    when "group"
                      get_view(MiqGroup, :named_scope => :non_tenant_groups_in_my_region)
                    when "role"
                      get_view(MiqUserRole)
                    when "tenant"
                      get_view(Tenant, :named_scope => :in_my_region)
                    end

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    @sb["rbac_#{rec_type}_sortcol"] = @sortcol
    @sb["rbac_#{rec_type}_sortdir"] = @sortdir
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def rbac_field_changed(rec_type)
    id = params[:id].split('__').first || 'new' # Get the record id
    id = id unless %w[new seq].include?(id)
    return unless load_edit("rbac_#{rec_type}_edit__#{id}", "replace_cell__explorer")

    case rec_type
    when "user"  then rbac_user_get_form_vars
    when "group" then rbac_group_get_form_vars
    when "role"  then rbac_role_get_form_vars
    end

    @edit[:new][:group] = rbac_user_get_group_ids.map(&:to_i) if rec_type == "user"
    session[:changed] = changed = (@edit[:new] != @edit[:current])
    bad = false
    if rec_type == "group"
      bad = (@edit[:new][:role].blank? || @edit[:new][:group_tenant].blank?)
    end
    bad = @edit[:new][:name].blank? if rec_type == 'role'

    render :update do |page|
      page << javascript_prologue
      if %w[up down].include?(params[:button])
        if @refresh_div
          page.replace("flash_msg_div", :partial => "layouts/flash_msg") if @refresh_div == "column_lists"
          page.replace(@refresh_div, :partial => @refresh_partial)
        end
        bad = false
      else
        # only do following for user (adding/editing a user)
        if x_node.split("-").first == "u" || x_node == "xx-u"
          page.replace("group_selected",
                       :partial => "ops/rbac_group_selected")
        end
        # only do following for groups
        if @refresh_div
          page.replace(@refresh_div,
                       :partial => @refresh_partial,
                       :locals  => {:type => "classifications", :action_url => 'rbac_group_field_changed'})
        end

        page.replace("customer_tags_div", :partial => "ops/rbac_group/customer_tags") if params[:use_filter_expression].present?

        # Only update description field value if ldap group user field was selected
        page << "$('#description').val('#{j_str(@edit[:new][:ldap_groups_user])}');" if params[:ldap_groups_user]

        # don't do anything to lookup box when checkboxes on the right side are checked
        page << set_element_visible('group_lookup', @edit[:new][:lookup]) unless params[:check]
      end
      page << javascript_for_miq_button_visibility(changed && !bad)
    end
  end

  # Common User button handler routine
  def process_groups(groups, task)
    process_elements(groups, MiqGroup, task)
  end

  # Common User button handler routine
  def process_users(users, task)
    process_elements(users, User, task)
  end

  # Common Role button handler routine
  def process_roles(roles, task)
    process_elements(roles, MiqUserRole, task)
  end

  def process_tenants(tenants, task)
    process_elements(tenants, Tenant, task, _("Tenant"), "name")
  end

  # Get information for an access control node
  def rbac_get_info
    node, id = x_node.split("-")
    case node
    when "xx"
      case id
      when "u"
        @right_cell_text = _("Access Control EVM Users")
        rbac_users_list
      when "g"
        @right_cell_text = _("Access Control EVM Groups")
        rbac_groups_list
      when "ur"
        @right_cell_text = _("Access Control Roles")
        rbac_roles_list
      when "tn"
        @right_cell_text = _("Access Control Tenants")
        rbac_tenants_list
      end
    when "u"
      @right_cell_text = _("EVM User \"%{name}\"") % {:name => User.find(id).name}
      rbac_user_get_details(id)
    when "g"
      @right_cell_text = _("EVM Group \"%{name}\"") % {:name => MiqGroup.find(id).description}
      @edit = nil
      rbac_group_get_details(id)
    when "ur"
      @right_cell_text = _("Role \"%{name}\"") % {:name => MiqUserRole.find(id).name}
      rbac_role_get_details(id)
    when "tn"
      rbac_tenant_get_details(id)
      @right_cell_text = _("%{model} \"%{name}\"") % {:model => tenant_type_title_string(@tenant.divisible),
                                                      :name  => @tenant.name}
    else # Root node
      @right_cell_text = _("Access Control Region \"%{name}\"") %
                         {:name => "#{MiqRegion.my_region.description} [#{MiqRegion.my_region.region}]"}
      @users_count   = Rbac.filtered(User.in_my_region).count
      @groups_count  = Rbac.filtered(MiqGroup.non_tenant_groups_in_my_region).count
      @roles_count   = Rbac.filtered(MiqUserRole).count
      @tenants_count = Rbac.filtered(Tenant.in_my_region).count
    end
  end

  def rbac_user_get_details(id)
    @edit = nil
    @record = @user = User.find(id)
    get_tagdata(@user)
  end

  def rbac_tenant_get_details(id)
    @record = @tenant = Tenant.find(id)
    get_tagdata(@tenant)
  end

  def rbac_group_get_details(id)
    @record = @group = MiqGroup.find_by(:id => id)
    @belongsto = {}
    @filters = {}
    @filter_expression = []
    @use_filter_expression = false
    if @record.present?
      get_tagdata(@group)
      @use_filter_expression = @group.entitlement[:filter_expression].kind_of?(MiqExpression)
      # Build the belongsto filters hash
      @group.get_belongsto_filters.each do |b| # Go thru the belongsto tags
        bobj = MiqFilter.belongsto2object(b) # Convert to an object
        if bobj
          @belongsto[bobj.class.to_s + "_" + bobj.id.to_s] = b # Store in hash as <class>_<id> string
        else
          @deleted_belongsto_filters ||= []
          @deleted_belongsto_filters.push(MiqFilter.belongsto2path_human(b))
        end
      end
      # Build the managed filters hash
      [@group.get_managed_filters].flatten.each do |f|
        @filters[f.split("/")[-2] + "-" + f.split("/")[-1]] = f
      end
    end

    rbac_group_right_tree(@belongsto.keys)
  end

  # this causes the correct tree to get instantiated, depending on the active tab
  def rbac_group_right_tree(selected_nodes)
    case @sb[:active_rbac_group_tab]
    when 'rbac_customer_tags'
      cats = Classification.categories.select do |c|
        c.show || !%w[folder_path_blue folder_path_yellow].include?(c.name) && !(c.read_only? || c.entries.empty)
      end
      cats.sort_by! { |t| t.description.try(:downcase) } # Get the categories, sort by description
      tags = cats.map do |cat|
        {
          :id          => cat.id,
          :description => cat.description,
          :singleValue => false,
          :values      => cat.entries.sort_by { |e| e[:description.downcase] }.map do |entry|
            { :id => entry.id, :description => entry.description }
          end
        }
      end

      filters = @edit&.fetch_path(:new, :filters) || @filters
      assigned_tags = Tag.where(:name => filters.flatten).map do |tag|
        {
          :description => tag.category.description,
          :id          => tag.category.id,
          :values      => [{:id => tag.classification.id, :description => tag.classification.description}]
        }
      end

      assigned_tags.each_with_object([]) do |tag, arr|
        existing_tag = arr.find { |item| item[:id] == tag[:id] }
        if existing_tag
          existing_tag[:values].push(*tag[:values])
        else
          arr << tag
        end
      end

      assigned_tags.uniq! { |tag| tag[:id] }
      group_id = @group&.id
      @tags = {:tags => tags, :assignedTags => assigned_tags, :affectedItems => [group_id]}
      @button_urls = {
        :save_url   => url_for_only_path(:action => "rbac_group_edit", :id => group_id, :button => "save"),
        :cancel_url => url_for_only_path(:action => "rbac_group_edit", :id => group_id, :button => "cancel")
      }
    when 'rbac_hosts_clusters'
      @hac_tree = TreeBuilderBelongsToHac.new(:hac_tree,
                                              @sb,
                                              true,
                                              :edit           => @edit,
                                              :group          => @group,
                                              :selected_nodes => selected_nodes)
    when 'rbac_vms_templates'
      @vat_tree = TreeBuilderBelongsToVat.new(:vat_tree,
                                              @sb,
                                              true,
                                              :edit           => @edit,
                                              :group          => @group,
                                              :selected_nodes => selected_nodes)
    end
  end

  def rbac_role_get_details(id)
    @edit = nil
    @record = @role = MiqUserRole.find(id)
    @rbac_menu_tree = build_rbac_feature_tree
  end

  def build_rbac_feature_tree
    @role = @sb[:typ] == "copy" ? @record.dup : @record if @role.nil? # if on edit screen use @record
    @role.miq_product_features = @record.miq_product_features if @sb[:typ] == "copy"
    TreeBuilderOpsRbacFeatures.new("features_tree", @sb, true, :role => @role, :editable => @edit.present?)
  end

  # Set form variables for role edit
  def rbac_user_set_form_vars
    copy = @sb[:typ] == "copy"
    # save a shadow copy of the record if record is being copied
    @user = copy ? @record.dup : @record
    @user.miq_groups = @record.miq_groups if copy
    @edit = {:new => {}, :current => {}}
    @edit[:user_id] = @record.id unless copy
    @edit[:key] = "rbac_user_edit__#{@edit[:user_id] || "new"}"
    # prefill form fields for edit and copy action
    @edit[:new].merge!(:name  => @user.name,
                       :email => @user.email,
                       :group => @user.miq_groups ? @user.miq_groups.map(&:id) : nil)
    unless copy
      @edit[:new].merge!(:userid   => @user.userid,
                         :password => @user.password,
                         :verify   => @user.password)
    end
    # load all user groups, filter available for tenant
    @edit[:groups] = Rbac.filtered(MiqGroup.non_tenant_groups_in_my_region).sort_by { |g| g.description.downcase }.collect { |g| [g.description, g.id] }
    # store current state of the new users information
    @edit[:current] = copy_hash(@edit[:new])
    @right_cell_text = if @edit[:user_id]
                         _("Editing User \"%{name}\"") % {:name => @record.name}
                       else
                         _('Adding a new User')
                       end
  end

  # Get variables from user edit form
  def rbac_user_get_form_vars
    @edit[:new][:name] = params[:name].presence if params[:name]
    @edit[:new][:userid] = params[:userid].strip.presence if params[:userid]
    @edit[:new][:email] = params[:email].strip.presence if params[:email]
    @edit[:new][:group] = params[:chosen_group] if params[:chosen_group]

    @edit[:new][:password] = params[:password].presence if params[:password]
    @edit[:new][:verify] = params[:verify].presence if params[:verify] # Confirm Password form
  end

  # Set user record variables to new values
  def rbac_user_set_record_vars(user)
    user.name       = @edit[:new][:name]
    user.userid     = @edit[:new][:userid]
    user.email      = @edit[:new][:email]
    user.password   = @edit[:new][:password] if @edit[:new][:password]
  end

  # Get array of group ids
  def rbac_user_get_group_ids
    case @edit[:new][:group]
    when 'null', nil
      []
    when String
      @edit[:new][:group].split(',').delete_if(&:blank?).sort
    when Array
      @edit[:new][:group].sort
    end
  end

  # Validate some of the user fields
  def rbac_user_validate?
    valid = true
    if @edit[:new][:password] != @edit[:new][:verify]
      add_flash(_("Password/Verify Password do not match"), :error)
      valid = false
    end

    new_group_ids = rbac_user_get_group_ids
    new_groups = new_group_ids.present? && MiqGroup.find(new_group_ids).present? ? MiqGroup.find(new_group_ids) : []

    if new_group_ids.blank?
      add_flash(_("A User must be assigned to a Group"), :error)
      valid = false
    elsif Rbac.filtered(new_groups).count != new_group_ids.count
      add_flash(_("A User must be assigned to an allowed Group"), :error)
      valid = false
    end
    valid
  end

  def valid_tenant?(tenant_id)
    Rbac.filtered(Tenant.in_my_region.where(:id => tenant_id)).present?
  end

  def valid_role?(user_role_id)
    Rbac::Filterer.filtered_object(user_role_id, :class => MiqUserRole).present?
  end

  # Get variables from group edit form
  def rbac_group_get_form_vars
    if %w[up down].include?(params[:button])
      move_cols_up   if params[:button] == "up"
      move_cols_down if params[:button] == "down"
    else
      @edit[:new][:ldap_groups_user] = params[:ldap_groups_user]  if params[:ldap_groups_user]
      @edit[:new][:description]      = params[:description]       if params[:description]

      if params[:group_role]
        if valid_role?(new_role_id = params[:group_role].to_i)
          @edit[:new][:role] = new_role_id
        else
          raise "Invalid group selected."
        end
      end

      if params[:group_tenant]
        if valid_tenant?(new_tenant_id = params[:group_tenant].to_i)
          @edit[:new][:group_tenant] = new_tenant_id
        else
          raise "Invalid tenant selected."
        end
      end

      @edit[:new][:lookup]           = (params[:lookup] == "1")   if params[:lookup]
      @edit[:new][:user]             = params[:user]              if params[:user]
      @edit[:new][:user_id]          = params[:user_id]           if params[:user_id]
      @edit[:new][:user_pwd]         = params[:password]          if params[:password]
    end

    if params[:check]                               # User checked/unchecked a tree node
      if params[:tree_typ] == "tags"                # MyCompany tag checked
        cat_name = Classification.find_by(:id => params[:cat]).name
        tag_name = Classification.find_by(:id => params[:val]).name
        if params[:check] == "0" #   unchecked
          @edit[:new][:filters].except!("#{cat_name}-#{tag_name}") # Remove the tag from the filters array
        else
          @edit[:new][:filters]["#{cat_name}-#{tag_name}"] = "/managed/#{cat_name}/#{tag_name}" # Put them in the hash
        end
      else # Belongsto tag checked
        class_prefix, id = parse_nodetype_and_id(params[:id])
        klass = TreeBuilder.get_model_for_prefix(class_prefix)
        # If ExtManagementSystem/Host is returned get specific class
        if %w[ExtManagementSystem Host].include?(klass)
          klass = find_record_with_rbac(klass.constantize, id).class.to_s
        end
        if params[:check] == "0" #   unchecked
          @edit[:new][:belongsto].delete("#{klass}_#{id}") # Remove the tag from the belongsto hash
        else
          object = klass.safe_constantize.find(id)
          # Put the tag into the belongsto hash
          @edit[:new][:belongsto]["#{klass}_#{id}"] = MiqFilter.object2belongsto(object)
        end
      end
    end

    if params[:use_filter_expression]
      @edit[:new][:use_filter_expression] = params[:use_filter_expression]
      @group = MiqGroup.find_by(:id => @edit[:group_id])
      rbac_group_right_tree(@edit[:new][:belongsto].keys)
      if params[:use_filter_expression] == 'false'
        @edit[:new][:use_filter_expression] = false
      elsif params[:use_filter_expression] == 'true'
        @edit[:use_filter_expression] = true
      end
    end

    params[:tree_typ] ? params[:tree_typ] + "_tree" : nil
  end

  # Set form variables for user add/edit
  def rbac_group_set_form_vars
    @assigned_filters = []
    @group = @record
    @edit = {
      :new                 => {
        :filters           => {},
        :filter_expression => {},
        :belongsto         => {},
        :description       => @group.description,
      },
      :ldap_groups_by_user => [],
      :projects_tenants    => [],
      :roles               => {},
    }
    @edit[:group_id] = @record.id
    @edit[:key] = "rbac_group_edit__#{@edit[:group_id] || "new"}"

    # Build the managed filters hash
    [@group.get_managed_filters].flatten.each do |f|
      @edit[:new][:filters][f.split("/")[-2] + "-" + f.split("/")[-1]] = f
    end
    # Build the belongsto filters hash
    @group.get_belongsto_filters.each do |b| # Go thru the belongsto tags
      bobj = MiqFilter.belongsto2object(b)   # Convert to an object
      if bobj
        @edit[:new][:belongsto][bobj.class.to_s + "_" + bobj.id.to_s] = b # Store in hash as <class>_<id> string
      else
        @deleted_belongsto_filters ||= []
        @deleted_belongsto_filters.push(MiqFilter.belongsto2path_human(b))
      end
    end

    # Build roles hash
    placeholder_text_role = _('Choose a Role')
    @edit[:roles]["<#{placeholder_text_role}>"] = nil if @record.id.nil?

    Rbac::Filterer.filtered(MiqUserRole).each do |r|
      @edit[:roles][r.name] = r.id
    end
    @edit[:new][:role] = if @group.miq_user_role.nil? # If adding, set to first role
                           @edit[:roles][@edit[:roles].keys.sort[0]]
                         else
                           @group.miq_user_role.id
                         end

    all_tenants, all_projects = Tenant.tenant_and_project_names
    placeholder_text_tenant = _('Choose a Project/Tenant')
    @edit[:projects_tenants].push(["", [["<#{placeholder_text_tenant}>",
                                         :selected => "<#{placeholder_text_tenant}>",
                                         :disabled => "<#{placeholder_text_tenant}>",
                                         :style    => 'display:none']]])
    @edit[:projects_tenants].push(["Projects", all_projects]) if all_projects.present?
    @edit[:projects_tenants].push(["Tenants", all_tenants]) if all_tenants.present?
    @edit[:new][:group_tenant] = @group.tenant_id

    rbac_group_filter_expression_vars(:filter_expression, :filter_expression_table)
    @edit[:current] = copy_hash(@edit[:new])

    @right_cell_text = if @edit[:group_id]
                         _("Editing Group \"%{name}\"") % {:name => @record.description}
                       else
                         _('Adding a new Group')
                       end

    rbac_group_right_tree(@edit[:new][:belongsto].keys)
    @edit[:current][:deleted_belongsto_filters] = @deleted_belongsto_filters
    @edit[:new][:belongsto].except!(*@deleted_belongsto_filters)
  end

  def rbac_group_filter_expression_vars(field_expression, field_expression_table)
    @edit[:new][field_expression] = if @group&.entitlement && @group.entitlement[field_expression].kind_of?(MiqExpression)
                                      @group.entitlement[field_expression].exp
                                    else
                                      @edit[:new][field_expression] = nil
                                    end
    @edit[:new][:use_filter_expression] = true
    # Populate exp editor fields for the expression column
    @edit[field_expression] ||= ApplicationController::Filter::Expression.new
    @edit[field_expression][:expression] = [] # Store exps in an array
    if @edit[:new][field_expression].blank?
      @edit[:new][:use_filter_expression] = false
      @edit[field_expression][:expression] = {"???" => "???"} # Set as new exp element
      @edit[:new][field_expression] = copy_hash(@edit[field_expression][:expression]) # Copy to new exp
    else
      @edit[field_expression][:expression] = copy_hash(@edit[:new][field_expression])
    end
    @edit[field_expression_table] = exp_build_table_or_nil(@edit[field_expression][:expression])

    @expkey = field_expression # Set expression key to expression
    @edit[field_expression].history.reset(@edit[field_expression][:expression])
    @edit[field_expression][:exp_table] = exp_build_table(@edit[field_expression][:expression])
    @edit[field_expression][:exp_model] = @group.class.to_s # Set model for the exp editor
  end

  # Set group record variables to new values
  def rbac_group_set_record_vars(group)
    role = MiqUserRole.find(@edit[:new][:role])
    group.description = @edit[:new][:description]
    group.miq_user_role = role
    group.tenant = Tenant.find(@edit[:new][:group_tenant]) if @edit[:new][:group_tenant]
    if @edit[:new][:use_filter_expression]
      @edit[:new][:filters].clear
    else
      exp_remove_tokens(@edit[:new][:filter_expression])
      @edit[:new][:filter_expression] = {}
    end

    rbac_group_set_filters(group) # Go set the filters for the group
  end

  # Set filters in the group record from the @edit[:new] hash values
  def rbac_group_set_filters(group)
    group.entitlement ||= Entitlement.new
    if @edit[:new][:use_filter_expression]
      group.entitlement.set_managed_filters(nil) if group.entitlement.get_managed_filters.present?
      group.entitlement.filter_expression = @edit[:new][:filter_expression]["???"] ? nil : MiqExpression.new(@edit[:new][:filter_expression])
    else
      @set_filter_values = []
      @edit[:new][:filters].each_value do |value|
        @set_filter_values.push(value)
      end
      group.entitlement.filter_expression = nil if group.entitlement.filter_expression
      rbac_group_make_subarrays # Need to have category arrays of item arrays for and/or logic
      group.entitlement.set_managed_filters(@set_filter_values)
    end
    group.entitlement.set_belongsto_filters(@edit[:new][:belongsto].values) # Set belongs to to hash values
  end

  # Need to make arrays by category containing arrays of items so the filtering logic can apply
  # AND between the categories, but OR between the items within a category
  def rbac_group_make_subarrays
    # moved into common method used by ops_settings module as well
    rbac_and_user_make_subarrays
  end

  # Set form variables for role edit
  def rbac_role_set_form_vars
    @edit = {}
    @edit[:role_id] = @record.id if @sb[:typ] != "copy"
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "rbac_role_edit__#{@edit[:role_id] || "new"}"

    @edit[:new][:name] = @record.name
    vmr = @record.settings.fetch_path(:restrictions, :vms) if @record.settings
    @edit[:new][:vm_restriction] = vmr || :none
    @edit[:new][:features] = rbac_expand_features(@record.miq_product_features.map(&:identifier)).sort

    @edit[:current] = copy_hash(@edit[:new])

    @role_features = @edit[:new][:features]
    @rbac_menu_tree = build_rbac_feature_tree

    @right_cell_text = if @edit[:role_id]
                         _("Editing Role \"%{name}\"") % {:name => @record.name}
                       else
                         _('Adding a new Role')
                       end
  end

  # Get array of total set of features from the children of selected features
  def rbac_expand_features(selected, node = nil)
    node ||= MiqProductFeature.feature_root
    if selected.include?(node)
      [node] + MiqProductFeature.feature_all_children(node)
    else
      MiqProductFeature.feature_children(node).flat_map { |n| rbac_expand_features(selected, n) }
    end
  end

  # Get array of all fully selected parent or leaf node features
  def rbac_compact_features(selected, node = nil)
    node ||= MiqProductFeature.feature_root
    return [node] if selected.include?(node)
    MiqProductFeature.feature_children(node, false).flat_map do |n|
      rbac_compact_features(selected, n)
    end
  end

  # Yield all features for given tree node a section or feature
  #
  # a. special case _tab_all_vm_rules
  # b. section node /^_tab_/
  #   return all features below this section and
  #   recursively below any nested sections
  #   and nested features recursively
  # c. feature node
  #   return nested features recursively
  #
  def recurse_sections_and_features(node)
    if node =~ /_tab_all_vm_rules$/
      MiqProductFeature.feature_children('all_vm_rules').each do |feature|
        kids = MiqProductFeature.feature_all_children(feature)
        yield feature, [feature] + kids
      end
    elsif node =~ /^_tab_/
      section_id = node.split('_tab_').last.to_sym
      Menu::Manager.section(section_id).features_recursive.each do |f|
        kids = MiqProductFeature.feature_all_children(f)
        yield f, [f] + kids
      end
    else
      kids = MiqProductFeature.feature_all_children(node)
      yield node, [node] + kids
    end
  end

  def rbac_role_get_form_vars
    @edit[:new][:name] = params[:name] if params[:name]
    @edit[:new][:vm_restriction] = params[:vm_restriction].to_sym if params[:vm_restriction]

    # Add/removed features based on the node that was checked
    if params[:check]
      node = params[:id].split("__").last # Get the feature of the checked node
      if params[:check] == "0" # Unchecked
        recurse_sections_and_features(node) do |feature, all|
          @edit[:new][:features] -= all # remove the feature + children
          rbac_role_remove_parent(feature) # remove all parents above the unchecked tab feature
        end
      else # Checked
        recurse_sections_and_features(node) do |feature, all|
          @edit[:new][:features] += all # remove the feature + children
          rbac_role_add_parent(feature) # remove all parents above the unchecked tab feature
        end
      end
    end
    @edit[:new][:features].uniq!
    @edit[:new][:features].sort!
  end

  # Walk the features tree, removing features up to the top
  def rbac_role_remove_parent(node)
    parent = MiqProductFeature.feature_parent(node)
    return unless parent

    @edit[:new][:features] -= [parent] # Remove the parent from the features array
    rbac_role_remove_parent(parent)    # Remove this nodes parent as well
  end

  # Walk the features tree, adding features up to the top
  def rbac_role_add_parent(node)
    return unless (parent = MiqProductFeature.feature_parent(node)) # Intentional single =, using parent var below
    if MiqProductFeature.feature_children(parent, false) - @edit[:new][:features] == [] # All siblings of node are selected
      @edit[:new][:features] += [parent]  # Add the parent to the features array
      rbac_role_add_parent(parent)        # See if this nodes parent needs to be added
    end
  end

  # Set role record variables to new values
  def rbac_role_set_record_vars(role)
    role.name = @edit[:new][:name]
    role.settings ||= {}
    if @edit[:new][:vm_restriction] == :none
      role.settings.delete(:restrictions)
    else
      role.settings[:restrictions] = {:vms => @edit[:new][:vm_restriction]}
    end
    role.settings = nil if role.settings.empty?
  end

  def populate_role_features(role)
    role.miq_product_features =
      MiqProductFeature.find_all_by_identifier(rbac_compact_features(@edit[:new][:features]))
  end

  # Validate some of the role fields
  def rbac_role_validate?
    if @edit[:new][:features].empty?
      add_flash(_("At least one Product Feature must be selected"), :error)
      return false
    end
    true
  end

  # Validate some of the role fields
  def rbac_group_validate?
    return false if @edit[:new][:description].nil?
    @assigned_filters = [] if @edit[:new][:filters].empty? || @edit[:new][:use_filter_expression]
    @filter_expression = [] if @edit[:new][:filter_expression].empty? || @edit[:new][:use_filter_expression] == false
    if @edit[:new][:role].nil? || @edit[:new][:role] == ""
      add_flash(_("A User Group must be assigned a Role"), :error)
      return false
    end
    true
  end
end
