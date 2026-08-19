# Access Control Accordion methods included in OpsController.rb
module OpsController::OpsRbac
  extend ActiveSupport::Concern

  TAG_DB_TO_NAME = {
    'MiqGroup' => 'group',
    'User'     => 'user',
    'Tenant'   => 'tenant'
  }.freeze

  def role_allows?(**options)
    if MiqProductFeature.my_root_tenant_identifier?(options[:feature]) && params.key?(:id) && params[:id] != 'xx-tn'
      if params[:id].to_s.include?('tn')
        _, id, _ = TreeBuilder.extract_node_model_and_id(params[:id].to_s)
      else
        id = params[:id].to_s
      end

      options[:feature] = MiqProductFeature.tenant_identifier(options[:feature], id)
      # dynamic tenant feature identifiers need to bypass feature validation
      options[:skip_feature_validation] = true
    end

    super(**options)
  end

  # Edit user or group tags
  def rbac_tags_edit
    assert_privileges("rbac_tenant_tags_edit")

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
    @hide_bottom_bar = true
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

    @copy_user_id = user_id
    assert_privileges("rbac_user_copy")
    @hide_bottom_bar = true
    rbac_edit_reset('copy', 'user', User)
  end

  def rbac_user_edit
    assert_privileges("rbac_user_edit")
    @hide_bottom_bar = true
    rbac_edit_reset(params[:typ], 'user', User)
  end

  def rbac_group_add
    assert_privileges("rbac_group_add")
    @record = MiqGroup.new
    @edit = {:group_id => nil, :key => "rbac_group_edit__new", :current => {}}
    @hide_bottom_bar = true
    @in_a_form = true
    session[:edit] = @edit
    @sb[:pre_edit_node] = x_node
    @right_cell_text = _('Adding a new Group')
    replace_right_cell(:nodetype => x_node)
  end

  def rbac_group_edit
    assert_privileges("rbac_group_edit")

    case params[:button]
    when 'cancel'
      add_flash(_("Edit of Group was cancelled by the user"))
      self.x_node = @sb[:pre_edit_node] if @sb[:pre_edit_node]
      get_node_info(x_node)
      @edit = nil
      replace_right_cell(:nodetype => @nodetype || x_node)
    when 'reset', nil
      @record = find_record_with_rbac(MiqGroup, checked_or_params)
      if @record.read_only
        add_flash(_("Read Only EVM Group \"%{name}\" can not be edited") % {:name => @record.description}, :warning)
        javascript_flash
        return
      end
      @edit = {:group_id => @record.id, :key => "rbac_group_edit__#{@record.id}"}
      @hide_bottom_bar = true
      @in_a_form = true
      session[:edit] = @edit
      session[:changed] = false
      @sb[:pre_edit_node] = x_node unless params[:button]
      @right_cell_text = _("Editing Group \"%{name}\"") % {:name => @record.description}
      replace_right_cell(:nodetype => x_node)
    end
  end

  def rbac_role_add
    assert_privileges("rbac_role_add")
    @hide_bottom_bar = true
    rbac_edit_reset('new', 'role', MiqUserRole)
  end

  def rbac_role_copy
    assert_privileges("rbac_role_copy")
    @hide_bottom_bar = true
    rbac_edit_reset('copy', 'role', MiqUserRole)
  end

  def rbac_role_edit
    assert_privileges("rbac_role_edit")
    @hide_bottom_bar = true
    # React form handles all interactions; this action only loads the page
    rbac_edit_reset(params[:typ], 'role', MiqUserRole)
  end

  def rbac_tenant_add
    assert_privileges("rbac_tenant_add")
    @_params[:typ] = "new"
    @tenant_type = params[:tenant_type] == "tenant"
    @tenant_parent = Tenant.find(x_node.split('-').last).id
    rbac_tenant_edit
  end
  alias rbac_project_add rbac_tenant_add

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
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node)
  end

  def rbac_tenant_manage_quotas_save_add
    get_node_info(x_node)
    replace_right_cell(:nodetype => "root", :replace_trees => [:rbac])
  end

  def rbac_tenant_manage_quotas_reset
    @tenant = find_record_with_rbac(Tenant, checked_or_params)
    # This is only because ops_controller tries to set form locals, otherwise we should not use the @edit variable
    @edit = {:tenant_id => @tenant.id}
    session[:edit] = {:key => "tenant_manage_quotas__#{@tenant.id}"}
    session[:changed] = false
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

  def rbac_user_delete
    assert_privileges("rbac_user_delete")
    users = []
    if params[:id] # showing a list
      if params[:id].nil? || !User.exists?(:id => params[:id])
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
          restricted_users.push(u) if rbac_user_delete_restriction?(u)
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
    if params[:id].nil? # showing a role list
      ids = find_checked_items.collect { |r| r.to_s.split("-").last }
      roles = MiqUserRole.where(:id => ids)
      process_roles(roles, "destroy") unless roles.empty?
    else # showing 1 role, delete it
      roles.push(params[:id])
      process_roles(roles, "destroy") unless roles.empty?
      self.x_node = "xx-ur" unless MiqUserRole.exists?(:id => params[:id]) # reset node to show list
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node, :replace_trees => [:rbac])
  end

  # Show the main Users/Groups/Roles list view
  def rbac_users_list
    assert_privileges("rbac_user_show_list")

    rbac_list("user")
  end

  def rbac_groups_list
    assert_privileges("rbac_group_show_list")

    rbac_list("group")
  end

  def rbac_roles_list
    assert_privileges("rbac_role_show_list")

    rbac_list("role")
  end

  def rbac_tenants_list
    assert_privileges("rbac_tenant_view")

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
    if params[:id].nil? # showing a list
      ids = find_checked_items.collect { |r| r.to_s.split("-").last }
      groups = MiqGroup.where(:id => ids)
      process_groups(groups, "destroy") unless groups.empty?
      self.x_node = "xx-g" # reset node to show list
    else # showing 1 group, delete it
      groups.push(params[:id])
      process_groups(groups, "destroy") unless groups.empty?
      self.x_node = "xx-g" unless MiqGroup.exists?(:id => params[:id]) # reset node to show list
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
          AuditEvent.success(build_saved_audit(group, @edit))
        else
          group.errors.each do |error|
            add_flash("#{error.attribute.to_s.capitalize} #{error.message}", :error)
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

  # GET /ops/group_form_data/:id
  def group_form_data
    assert_privileges(params[:id] == "new" ? "rbac_group_add" : "rbac_group_view")

    group = params[:id] == "new" ? MiqGroup.new : MiqGroup.non_tenant_groups.find(params.expect(:id))

    @sb[:trees] ||= {}

    selected_nodes = group.get_belongsto_filters.filter_map do |b|
      obj = MiqFilter.belongsto2object(b)
      "#{obj.class.name}_#{obj.id}" if obj
    end

    deleted_filters = group.get_belongsto_filters.filter_map do |b|
      MiqFilter.belongsto2path_human(b) unless MiqFilter.belongsto2object(b)
    end

    hac = TreeBuilderBelongsToHac.new(:hac_tree, @sb, true, :group => group, :selected_nodes => selected_nodes, :edit => true)
    vat = TreeBuilderBelongsToVat.new(:vat_tree, @sb, true, :group => group, :selected_nodes => selected_nodes, :edit => true)

    hac_paths = build_belongsto_path_map(JSON.parse(hac.bs_tree))
    vat_paths = build_belongsto_path_map(JSON.parse(vat.bs_tree))

    cats = Classification.categories.select do |c|
      c.show || (%w[folder_path_blue folder_path_yellow].exclude?(c.name) &&
                 !(c.read_only? || c.entries.empty?))
    end
    cats.sort_by! { |t| t.description.downcase }

    tags = cats.map do |cat|
      {
        :id          => cat.name,
        :label       => cat.description,
        :singleValue => false,
        :values      => cat.entries.sort_by { |e| e.description.downcase }
                           .map { |e| {:id => e.name, :label => e.description} }
      }
    end

    filters = group.id ? (group.entitlement&.get_managed_filters || []).flatten : []
    assigned_tags = Tag.where(:name => filters).filter_map do |tag|
      next unless tag.category && tag.classification

      {:label  => tag.category.description,
       :id     => tag.category.name,
       :values => [{:id => tag.classification.name, :label => tag.classification.description}]}
    end

    mode         = ::Settings.authentication.mode
    oidc_enabled = ::Settings.authentication.oidc_enabled
    saml_enabled = ::Settings.authentication.saml_enabled

    render :json => {
      :hac_tree                  => hac.bs_tree,
      :vat_tree                  => vat.bs_tree,
      :hac_paths                 => hac_paths,
      :vat_paths                 => vat_paths,
      :tags                      => {
        :tags          => tags,
        :assignedTags  => assigned_tags,
        :affectedItems => [group.id.to_s]
      },
      :deleted_belongsto_filters => deleted_filters,
      :can_lookup_ldap           => mode.downcase == "httpd" && !(saml_enabled || oidc_enabled),
      :auth_mode_name            => helpers.auth_mode_name,
    }
  end

  # POST /ops/rbac_group_user_lookup_json
  def rbac_group_user_lookup_json
    assert_privileges("rbac_group_edit")
    user = params[:user].to_s.strip

    if user.blank?
      render :json => {:error => _("User must be entered to perform LDAP Group Look Up")}, :status => 422
      return
    end

    groups = MiqGroup.get_httpd_groups_by_user(user)
    render :json => {:groups => groups.uniq.sort}
  rescue MiqException::RbacPrivilegeException
    raise
  rescue => bang
    render :json => {:error => _("Error during 'LDAP Group Look Up': %{message}") % {:message => bang.message}}, :status => 500
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
    id = params[:id] || "new"
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
      if %i[group role].include?(key) && record&.read_only && operation != 'copy'
        model, name = if key == :role
                        [_('Role'), record.name]
                      else
                        [_('EVM Group'), record.description]
                      end
        add_flash(_("Read Only %{model} \"%{name}\" can not be edited") % {:model => model, :name => name}, :warning)
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
    when :user then rbac_user_set_form_vars
    when :role then rbac_role_set_form_vars
    end

    @in_a_form = true
    session[:edit] = @edit
    session[:changed] = false
    add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"
    @sb[:pre_edit_node] = x_node  unless params[:button] # Save active tree node before edit
    replace_right_cell(:nodetype => x_node)
  end

  def rbac_edit_save_or_add(what, rbac_suffix = what)
    key         = what.to_sym
    id          = params[:id] || "new"
    add_pressed = params[:button] == "add"

    return unless load_edit("rbac_#{what}_edit__#{id}", "replace_cell__explorer")

    if record.valid? && validated && record.save!
      self.current_user = record if what == 'user' && @edit[:current][:userid] == current_userid
      AuditEvent.success(build_saved_audit(record, @edit))
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
    record.errors.each { |error| add_flash("#{error.attribute.to_s.capitalize} #{error.message}", :error) }

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
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, :list, @items_per_page) # Set the per page setting for this gtl type
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
      @users_count = Rbac.filtered(User.in_my_region).count
      @groups_count = Rbac.filtered(MiqGroup.non_tenant_groups_in_my_region).count
      @roles_count = Rbac.filtered(MiqUserRole).count
      @tenants_count = Rbac.filtered(Tenant.in_my_region).count
    end
  end

  def rbac_user_get_details(id)
    @edit = nil
    @record = @user = User.find(id)
    get_tagdata(@user)
  end

  def rbac_tenant_get_details(id)
    @record = @tenant = find_record_with_rbac(Tenant, id)
    get_tagdata(@tenant)
  end

  def rbac_group_get_details(id)
    @record = @group = MiqGroup.find_by(:id => id)
  end

  def rbac_role_get_details(id)
    @edit = nil
    @record = @role = MiqUserRole.find(id)
    @rbac_menu_tree = build_rbac_feature_tree
  end

  def build_rbac_feature_tree
    @role = @sb[:typ] == "copy" ? @record.dup : @record if @role.nil? # if on edit screen use @record
    @role.miq_product_features = @record.miq_product_features if @sb[:typ] == "copy"
    # The edit/noedit tree should have a different name due to a collision between RJS and Redux
    TreeBuilderOpsRbacFeatures.new(@edit.present? ? "features_tree" : "features_tree_noedit", @sb, true, :role => @role, :editable => @edit.present?)
  end

  # Set form variables for user edit
  def rbac_user_set_form_vars
    copy = @sb[:typ] == "copy"
    @edit = {:new => {}, :current => {}}
    @edit[:user_id] = @record.id unless copy
    @edit[:new][:userid] = @record.userid
    @right_cell_text = if @edit[:user_id]
                         _("Editing User \"%{name}\"") % {:name => @record.name}
                       else
                         _('Adding a new User')
                       end
  end

  def valid_tenant?(tenant_id)
    Rbac.filtered(Tenant.in_my_region.where(:id => tenant_id)).present?
  end

  def valid_role?(user_role_id)
    Rbac::Filterer.filtered_object(user_role_id, :class => "MiqUserRole").present?
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
    str = @record.settings.fetch_path(:restrictions, :service_templates) if @record.settings
    @edit[:new][:service_template_restriction] = str || :none
    @edit[:new][:features] = rbac_expand_features(@record.miq_product_features.map(&:identifier)).sort

    @edit[:current] = copy_hash(@edit[:new])

    @role_features = @edit[:new][:features]
    # Set @role for the view template - use dup when copying to avoid modifying @record
    @role = @sb[:typ] == "copy" ? @record.dup : @record
    @role.id = nil if @sb[:typ] == "copy"
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

  def build_belongsto_path_map(nodes, map = {})
    Array(nodes).each do |node|
      key = node["key"]
      if key.present?
        _model, rec_id, prefix = TreeBuilder.extract_node_model_and_id(key)
        klass_name = TreeBuilder.get_model_for_prefix(prefix)
        if klass_name && rec_id
          obj = klass_name.safe_constantize&.find_by(:id => rec_id)
          if obj
            begin
              map[key] = MiqFilter.object2belongsto(obj)
            rescue RuntimeError
              # skip nodes whose root is not a Provider (e.g. standalone folder roots)
            end
          end
        end
      end
      build_belongsto_path_map(node["nodes"], map) if node["nodes"].present?
    end
    map
  end
end
