module MiqPolicyController::MiqActions
  extend ActiveSupport::Concern

  def action_edit
    assert_privileges(params[:pressed]) if params[:pressed]
    case params[:button]
    when "cancel"
      @sb[:action] = @edit = nil
      @action = MiqAction.find(session[:edit][:action_id]) if session[:edit] && session[:edit][:action_id]
      if @action.present?
        add_flash(_("Edit of Action \"%{name}\" was cancelled by the user") % {:name => @action.description})
      else
        add_flash(_("Add of new Action was cancelled by the user"))
      end
      @sb[:action] = nil
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype, :remove_form_buttons => true)
      return
    when "reset", nil # Reset or first time in
      action_build_edit_screen
      @sb[:action] = "action_edit"
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "a")
      return
    end

    # Load @edit/vars for other buttons
    id = params[:id] ? params[:id] : "new"
    return unless load_edit("action_edit__#{id}", "replace_cell__explorer")
    @action = @edit[:action_id] ? MiqAction.find(@edit[:action_id]) : MiqAction.new
    case params[:button]
    when "save", "add"
      action = @action.id.blank? ? MiqAction.new : MiqAction.find(@action.id) # Get new or existing record

      # set email "from" to default value if it's not present
      if @edit[:new][:action_type] == "email" && @edit[:new][:options][:from].nil?
        @edit[:new][:options][:from] = "cfadmin@cfserver.com"
      end

      action_set_record_vars(action)
      if action_valid_record?(action) && !@flash_array && action.save
        AuditEvent.success(build_saved_audit(action, params[:button] == "add"))
        if params[:button] == "save"
          add_flash(_("Action \"%{name}\" was saved") % {:name => @edit[:new][:description]})
        else
          add_flash(_("Action \"%{name}\" was added") % {:name => @edit[:new][:description]})
        end
        action_get_info(MiqAction.find(action.id))
        @sb[:action] = @edit = nil
        @nodetype = "a"
        @new_action_node = "a-#{action.id}"
        replace_right_cell(:nodetype => "a", :replace_trees => params[:button] == "save" ? %i[policy_profile policy action] : %i[action], :remove_form_buttons => true)
        @sb[:action] = nil
      else
        action.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        javascript_flash
      end
    when "move_right", "move_left", "move_allleft"
      action_handle_selection_buttons(:alerts)
      session[:changed] = (@edit[:new] != @edit[:current])
      replace_right_cell(:nodetype => "a")
    end
  end

  def action_delete
    assert_privileges("action_delete")
    actions = []
    # showing 1 action, delete it
    if params[:id].nil? || !MiqAction.exists?(params[:id])
      add_flash(_("Action no longer exists"), :error)
    else
      actions.push(params[:id])
    end
    process_actions(actions, "destroy") unless actions.empty?
    @new_action_node = self.x_node = "root"
    get_node_info(x_node)
    replace_right_cell(:nodetype => "root", :replace_trees => %i[action])
  end

  def action_field_changed
    return unless load_edit("action_edit__#{params[:id]}", "replace_cell__explorer")
    @action = @edit[:action_id] ? MiqAction.find(@edit[:action_id]) : MiqAction.new

    copy_params_if_present(@edit[:new], params, %i[description])
    copy_params_if_present(@edit[:new][:options], params, %i[from to parent_type attribute value hosts])
    @edit[:new][:options][:name] = params[:snapshot_name].presence if params[:snapshot_name]
    @edit[:new][:options][:age] = params[:snapshot_age].to_i if params.key?(:snapshot_age)
    if params[:cpu_value]
      @edit[:new][:options][:value] = params[:cpu_value]
    elsif params[:memory_value]
      @edit[:new][:options][:value] = params[:memory_value]
    end
    @edit[:new][:options][:ae_message] = params[:object_message] if params.key?(:object_message)
    @edit[:new][:options][:ae_request] = params[:object_request] if params[:object_request]
    params.each do |var, val|
      vars = var.split("_")
      if vars[0] == "attribute" || vars[0] == "value"
        ApplicationController::AE_MAX_RESOLUTION_FIELDS.times do |i|
          f = ("attribute_" + (i + 1).to_s)
          v = ("value_" + (i + 1).to_s)
          @edit[:new][:attrs][i][0] = params[f] if params[f.to_sym]
          @edit[:new][:attrs][i][1] = params[v] if params[v.to_sym]
        end
      elsif vars[0] == "cat" # Handle category check boxes
        @edit[:new][:options][:cats] ||= []
        if val == "1"
          @edit[:new][:options][:cats].push(vars[1..-1].join("_")) # Add the category
        else
          @edit[:new][:options][:cats].delete(vars[1..-1].join("_")) # Remove the category
          @edit[:new][:options][:cats] = nil if @edit[:new][:options][:cats].blank?
        end
      end
    end
    @snmp_trap_refresh = build_snmp_options(:options, @edit[:new][:action_type] == "snmp_trap")
    @edit[:new][:options][:scan_item_set_name] = params[:analysis_profile] if params[:analysis_profile]
    @refresh_inventory = false
    if params[:inventory_manual] || params[:inventory_localhost] || params[:inventory_event_target]
      @refresh_inventory = true
      update_playbook_variables(params)
    end
    @edit[:new][:options][:service_template_id] = params[:service_template_id].to_i if params[:service_template_id]

    # Note that the params[:tag] here is intentionally singular
    @edit[:new][:options][:tags] = params[:tag].present? ? [Classification.find(params[:tag]).tag.name] : nil if params[:tag]

    if params[:miq_action_type] && params[:miq_action_type] != @edit[:new][:action_type] # action type was changed
      @edit[:new][:action_type] = params[:miq_action_type]
      @edit[:new][:options] = {} # Clear out the options
      action_build_alert_choices if params[:miq_action_type] == "evaluate_alerts" # Build alert choices hash
      action_build_snmp_variables if params[:miq_action_type] == "snmp_trap"      # Build snmp_trap variables hash
      action_initialize_playbook_variables
      @tags_select = build_tags_select if params[:miq_action_type] == "tag"
      @action_type_changed = true
    end

    send_button_changes
  end

  def build_tags_select
    Classification.categories.sort_by(&:description).each_with_object({}) do |cls, obj|
      next unless cls.show && cls.entries.any? && !cls.read_only
      obj[cls.description] = cls.entries.sort_by(&:description).map do |ent|
        # The third argument here allows better fuzzy search in the dropdown
        [ent.description, ent.id, 'data-tokens' => cls.description]
      end
    end
  end

  def action_initialize_playbook_variables
    @edit[:new][:options][:use_event_target] = @edit[:new][:inventory_type] == 'event_target'
    @edit[:new][:options][:use_localhost] = @edit[:new][:inventory_type] == 'localhost'
  end

  def update_playbook_variables(params)
    @edit[:new][:inventory_type] = params[:inventory_manual] if params[:inventory_manual]
    @edit[:new][:inventory_type] = params[:inventory_localhost] if params[:inventory_localhost]
    @edit[:new][:inventory_type] = params[:inventory_event_target] if params[:inventory_event_target]
    @edit[:new][:options][:hosts] = '' if params[:inventory_localhost] || params[:inventory_event_target]
    @edit[:new][:options][:use_event_target] = @edit[:new][:inventory_type] == 'event_target'
    @edit[:new][:options][:use_localhost] = @edit[:new][:inventory_type] == 'localhost'
  end

  def action_get_all
    peca_get_all('action', -> { get_view(MiqAction) })
  end

  private

  def process_actions(actions, task)
    process_elements(actions, MiqAction, task)
  end

  def action_build_snmp_variables
    @edit[:new][:options][:snmp_version] = "v1" if @edit[:new][:action_type] == "snmp_trap" && @edit[:new][:options][:snmp_version].blank?
    @edit[:snmp_var_types] = MiqSnmp.available_types
    @edit[:new][:options][:variables] ||= []
    10.times do |i|
      @edit[:new][:options][:variables][i] ||= {}
      @edit[:new][:options][:variables][i][:oid] ||= ""
      @edit[:new][:options][:variables][i][:var_type] ||= "<None>"
      @edit[:new][:options][:variables][i][:value] ||= ""
    end
  end

  # Handle the middle buttons on the Action add/edit Alerts form
  # pass in member list symbols (i.e. :policies)
  def action_handle_selection_buttons(members,
                                      members_chosen = :members_chosen,
                                      choices = :choices,
                                      choices_chosen = :choices_chosen)
    if params[:button].ends_with?("_left")
      if params[members_chosen].nil?
        add_flash(_("No %{members} were selected to move left") %
          {:members => members.to_s.split("_").first.titleize}, :error)
      else
        mems = @edit[:new][members].invert
        params[members_chosen].each do |mc|
          @edit[choices][mems[mc]] = mc
          @edit[:new][members].delete(mems[mc])
        end
      end
    elsif params[:button].ends_with?("_right")
      if params[choices_chosen].nil?
        add_flash(_("No %{members} were selected to move right") %
          {:members => members.to_s.split("_").first.titleize}, :error)
      else
        mems = @edit[choices].invert
        params[choices_chosen].each do |mc|
          @edit[:new][members][mems[mc]] = mc
          @edit[choices].delete(mems[mc])
        end
      end
    elsif params[:button].ends_with?("_allleft")
      if @edit[:new][members].empty?
        add_flash(_("No %{members} were selected to move left") %
          {:members => members.to_s.split("_").first.titleize}, :error)
      else
        @edit[:new][members].each do |key, value|
          @edit[choices][key] = value
        end
        @edit[:new][members].clear
      end
    end
  end

  def action_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    @action = params[:id] ? MiqAction.find(params[:id]) : MiqAction.new # Get existing or new record
    @edit[:key] = "action_edit__#{@action.id || "new"}"
    @edit[:rec_id] = @action.id || nil

    @edit[:action_id] = @action.id
    @edit[:new][:description] = @action.description
    @edit[:new][:action_type] = @action.action_type.presence
    @edit[:new][:options] = @action.options ? copy_hash(@action.options) : {}

    @edit[:new][:object_message] = @edit[:new][:options][:ae_message] unless @edit[:new][:options][:ae_message].nil?
    @edit[:new][:object_request] = @edit[:new][:options][:ae_request] unless @edit[:new][:options][:ae_request].nil?
    @edit[:new][:attrs] ||= []
    ApplicationController::AE_MAX_RESOLUTION_FIELDS.times { @edit[:new][:attrs].push([]) }
    @edit[:new][:options][:ae_hash]&.each_with_index do |kv, i|
      @edit[:new][:attrs][i][0] = kv[0]
      @edit[:new][:attrs][i][1] = kv[1]
    end

    @edit[:new][:scan_profiles] = ScanItemSet.order(:name).pluck(:name)

    action_build_alert_choices
    unless @edit[:new][:options][:alert_guids].nil?
      @edit[:new][:options][:alert_guids].each do |ag| # Add alerts to the alert_members hash
        alert = MiqAlert.find_by(:guid => ag)
        @edit[:new][:alerts][alert.description] = ag unless alert.nil?
      end
      @edit[:new][:alerts].each do |am|
        @edit[:choices].delete(am.first) # Remove any choices already in the list
      end
    end
    action_build_snmp_variables if @action.action_type == "snmp_trap"

    # Build arrays for inherit/remove_tags action types
    @edit[:tag_parent_types] =  [["<#{_('Choose')}>", nil],
                                 [_("Cluster / Deployment Role"), "ems_cluster"],
                                 [_("Host"), "host"],
                                 [_("Datastore"), "storage"],
                                 [_("Resource Pool"), "parent_resource_pool"]].sort_by { |x| x.first.downcase }
    @edit[:cats] = MiqAction.inheritable_cats.sort_by { |c| c.description.downcase }.collect { |c| [c.name, c.description] }

    @edit[:ansible_playbooks] = ServiceTemplateAnsiblePlaybook.order(:name).pluck(:name, :id) || {}
    @edit[:new][:inventory_type] = 'localhost'
    action_build_playbook_variables if @action.action_type == "run_ansible_playbook"

    @edit[:current] = copy_hash(@edit[:new])

    # Build the category entity dropdown organized by categories
    @tags_select = build_tags_select

    # Retrieve the selected tag's object based on the stored tag name
    @selected_tag = Classification.tag_name_to_objects(@edit[:new][:options][:tags].to_a.first).last if @edit[:new][:options][:tags].present?

    @in_a_form = true
    @edit[:current][:add] = true if @edit[:action_id].nil? # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  # Build the alert choice hash for evaluate_alerts action_type
  def action_build_alert_choices
    @edit[:choices] = MiqAlert.all.each_with_object({}) { |a, h| h[a.description] = a.guid } # Build the hash of alert choices
    @edit[:new][:alerts] = {} # Clear out the alerts hash
  end

  # Set action record variables to new values
  def action_set_record_vars(action)
    action.description = @edit[:new][:description]
    action.action_type = @edit[:new][:action_type]
    @edit[:new][:options][:ae_hash] = {}
    @edit[:new][:attrs]&.each do |pair|
      @edit[:new][:options][:ae_hash][pair[0]] = pair[1] if pair[0].present? && pair[1].present?
    end
    @edit[:new][:options].delete("ae_hash".to_sym) if @edit[:new][:options][:ae_hash].empty?
    @edit[:new][:object_message] = @edit[:new][:options][:ae_message] unless @edit[:new][:options][:ae_message].nil?
    @edit[:new][:object_request] = @edit[:new][:options][:ae_request] unless @edit[:new][:options][:ae_request].nil?

    if @edit[:new][:action_type] == "evaluate_alerts"   # Handle evaluate_alerts action type
      @edit[:new][:options][:alert_guids] = []          # Create the array in options
      @edit[:new][:alerts].each_value do |a|            # Go thru the alerts hash
        @edit[:new][:options][:alert_guids].push(a)     # Add all alert guids to the array
      end
    end

    if @edit[:new][:options]
      action.options = if @edit[:new][:options][:scan_item_set_name]
                         {:scan_item_set_name => @edit[:new][:options][:scan_item_set_name]}
                       else
                         copy_hash(@edit[:new][:options])
                       end
    end
  end

  def action_build_playbook_variables
    @edit[:new][:inventory_type] = 'manual' if @edit[:new][:options][:hosts]
    @edit[:new][:inventory_type] = 'event_target' if @edit[:new][:options][:use_event_target]
    @edit[:new][:inventory_type] = 'localhost' if @edit[:new][:options][:use_localhost]
  end

  # Check action record variables
  def action_valid_record?(rec)
    edit = @edit[:new]
    options = edit[:options]
    add_flash(_("Description is required"), :error) if edit[:description].blank?
    add_flash(_("Action Type must be selected"), :error) if edit[:action_type].blank?
    if edit[:action_type] == "assign_scan_profile" && options[:scan_item_set_name].blank?
      add_flash(_("Analysis Profile is required"), :error)
    end
    if edit[:action_type] == "set_custom_attribute" && options[:attribute].blank?
      add_flash(_("Attribute Name is required"), :error)
    end
    edit[:attrs].each do |k, v|
      add_flash(_("Attribute missing for %{field}") % {:field => v}, :error) if k.blank? && v.present?
      add_flash(_("Value missing for %{field}") % {:field => k}, :error) if k.present? && v.blank?
    end
    if edit[:action_type] == "evaluate_alerts" && edit[:alerts].empty?
      add_flash(_("At least one Alert must be selected"), :error)
    end
    if edit[:action_type] == "inherit_parent_tags" && options[:parent_type].blank?
      add_flash(_("Parent Type must be selected"), :error)
    end
    if %w[inherit_parent_tags remove_tags].include?(edit[:action_type]) && options[:cats].blank?
      add_flash(_("At least one Category must be selected"), :error)
    end
    if edit[:action_type] == "delete_snapshots_by_age" && options[:age].blank?
      add_flash(_("Snapshot Age must be selected"), :error)
    end
    if edit[:action_type] == "email"
      add_flash(_("E-mail address 'From' is not valid"), :error) unless edit[:options][:from].to_s.email?
      add_flash(_("E-mail address 'To' is not valid"), :error) unless edit[:options][:to].to_s.email?
    end
    if edit[:action_type] == "snmp_trap"
      validate_snmp_options(options)
      unless @flash_array
        rec[:options][:variables] = options[:variables].reject { |var| var[:oid].blank? }
      end
    end

    validate_playbook_options(options) if edit[:action_type] == "run_ansible_playbook"

    if edit[:action_type] == "tag" && options[:tags].blank?
      add_flash(_("At least one Tag must be selected"), :error)
    end
    @flash_array.nil?
  end

  def validate_playbook_options(options)
    add_flash(_("An Ansible Playbook must be selected"), :error) if options[:service_template_id].blank?
    if @edit[:new][:inventory_type] == 'manual' && options[:hosts].blank?
      add_flash(_("At least one host must be specified for manual mode"), :error)
    end
  end

  # Get information for an action
  def action_get_info(action)
    @record = @action = action
    @right_cell_text = _("Action \"%{name}\"") % {:name => action.description}
    @right_cell_div = "action_details"
    @alert_guids = []
    if action.options && action.options[:alert_guids]
      @alert_guids = MiqAlert.where(:guid => action.options[:alert_guids])
    end

    if x_active_tree == :action_tree
      @action_policies = @action.miq_policies.sort_by { |p| p.description.downcase }
    end

    if %w[inherit_parent_tags remove_tags].include?(@action.action_type)
      @cats = Classification.lookup_by_names(@action.options[:cats]).pluck(:description).sort_by(&:downcase).join(" | ")
    end
  end
end
