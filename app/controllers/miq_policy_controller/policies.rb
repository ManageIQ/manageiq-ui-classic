module MiqPolicyController::Policies
  extend ActiveSupport::Concern

  def policy_edit_cancel
    id = params[:id] || "new"
    return unless load_edit("policy_edit__#{id}", "replace_cell__explorer")

    @policy = MiqPolicy.find_by(:id => @edit[:policy_id]) if @edit[:policy_id]
    if @policy.present?
      add_flash(_("Edit of Policy \"%{name}\" was cancelled by the user") % {:name => @policy.description})
    else
      add_flash(_("Add of new Policy was cancelled by the user"))
    end
    @sb[:action] = @edit = nil
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype, :remove_form_buttons => true)
  end

  def policy_edit_reset
    @sb[:action] = "policy_edit"
    policy_build_edit_screen(session[:edit].try(:key?, :typ) ? session[:edit][:typ] : params[:typ])
    if params[:button] == "reset"
      add_flash(_("All changes have been reset"), :warning)
    end
    replace_right_cell(:nodetype => "p")
  end

  def policy_edit_save
    assert_privileges("policy_#{@policy.id ? "edit" : "new"}")
    policy = @policy.id.blank? ? MiqPolicy.new : MiqPolicy.find(@policy.id) # Get new or existing record
    policy.mode = @edit[:new][:mode]
    policy.updated_by = session[:userid]

    if @policy.id.blank?
      policy.towhat = @edit[:new][:towhat]
      policy.created_by = session[:userid]
    end

    case @edit[:typ]
    when "basic"
      policy.description = @edit[:new][:description]
      policy.active = @edit[:new][:active]
      policy.notes = @edit[:new][:notes]
      policy.expression = @edit[:new][:expression]["???"] ? nil : MiqExpression.new(@edit[:new][:expression])
    when "conditions"
      mems = @edit[:new][:conditions].invert # Get the ids from the member list box
      policy.conditions.collect { |pc| pc }.each { |c| policy.conditions.delete(c) unless mems.key?(c.id) } # Remove any conditions no longer in members
      mems.each_key { |m| policy.conditions.push(Condition.find(m)) unless policy.conditions.collect(&:id).include?(m) } # Add any new conditions
    end

    if !policy.valid? || @flash_array || !policy.save
      policy.errors.each do |field, msg|
        add_flash("#{field.to_s.capitalize} #{msg}", :error)
      end
      javascript_flash
      return
    end

    if @policy.id.blank? && policy.mode == "compliance" # New compliance policy
      event = MiqEventDefinition.find_by(:name => "#{policy.towhat.downcase}_compliance_check") # Get the compliance event record
      policy.sync_events([event]) # Set the default compliance event in the policy
      action_list = [[MiqAction.find_by(:name => 'compliance_failed'), {:qualifier => :failure, :synchronous => true}]]
      policy.replace_actions_for_event(event, action_list) # Add in the default action for the compliance event
    end
    policy.sync_events(@edit[:new][:events].collect { |e| MiqEventDefinition.find(e) }) if @edit[:typ] == "events"
    AuditEvent.success(build_saved_audit(policy, params[:button] == "add"))
    if params[:button] == "save"
      add_flash(_("Policy \"%{name}\" was saved") % {:name => @edit[:new][:description]})
    else
      add_flash(_("Policy \"%{name}\" was added") % {:name => @edit[:new][:description]})
    end
    policy_get_info(MiqPolicy.find(policy.id))
    @sb[:action] = @edit = nil
    @nodetype = "p"

    case x_active_tree
    when :policy_profile_tree
      replace_right_cell(:nodetype => "p", :replace_trees => %i[policy_profile policy], :remove_form_buttons => true)
    when :policy_tree
      @nodetype = "p"
      if params[:button] == "add"
        self.x_node = @new_policy_node = policy_node(policy)
        get_node_info(@new_policy_node)
      end
      replace_right_cell(:nodetype => "p", :replace_trees => params[:button] == "save" ? %i[policy_profile policy] : %i[policy], :remove_form_buttons => true)
    end
  end

  def policy_edit_move
    handle_selection_buttons(:conditions)
    session[:changed] = (@edit[:new] != @edit[:current])
    replace_right_cell(:nodetype => "p")
  end

  def policy_edit_load_policy
    # Load @edit/vars for other buttons
    id = params[:id] || "new"
    return unless load_edit("policy_edit__#{id}", "replace_cell__explorer")

    @edit[:policy_id] ? MiqPolicy.find_by(:id => @edit[:policy_id]) : MiqPolicy.new
  end

  def policy_edit
    assert_privileges(params[:id] ? 'policy_edit' : 'policy_new')
    case params[:button]
    when "cancel"
      policy_edit_cancel
    when "reset", nil # Reset or first time in
      policy_edit_reset
    when "save", "add"
      @policy = policy_edit_load_policy
      policy_edit_save
    when "move_right", "move_left", "move_allleft"
      @policy = policy_edit_load_policy
      policy_edit_move
    end
  end

  # Copy a policy
  def policy_copy
    assert_privileges("policy_copy")
    policy = MiqPolicy.find(params[:id])
    new_desc = truncate("Copy of #{policy.description}", :length => 255, :omission => "")
    if MiqPolicy.find_by(:description => new_desc)
      add_flash(_("Policy \"%{name}\" already exists") % {:name => new_desc}, :error)
      javascript_flash
    else
      new_pol = policy.copy(:description => new_desc, :created_by => session[:userid], :read_only => nil)
      AuditEvent.success(:event        => "miqpolicy_copy",
                         :target_id    => new_pol.id,
                         :target_class => "MiqPolicy",
                         :userid       => session[:userid],
                         :message      => "New Policy ID %{new_id} was copied from Policy ID %{old_id}" %
                                          {:new_id => new_pol.id, :old_id => policy.id})
      add_flash(_("Policy \"%{name}\" was added") % {:name => new_desc})
      @new_policy_node = policy_node(policy)
      get_node_info(@new_policy_node)
      replace_right_cell(:nodetype => "p", :replace_trees => %i[policy])
    end
  end

  def policy_field_changed
    assert_privileges(params[:id] == 'new' ? 'policy_new' : 'policy_edit')
    return unless load_edit("policy_edit__#{params[:id]}", "replace_cell__explorer")

    @profile = @edit[:profile]

    case @edit[:typ]
    when "basic"
      @edit[:new][:description] = params[:description].presence if params[:description]
      @edit[:new][:notes] = params[:notes].presence if params[:notes]
      @edit[:new][:active] = (params[:active] == "1") if params.key?(:active)
    when "events"
      params.each do |field, _value|
        if field.to_s.starts_with?("event_")
          event = field.to_s.split("_").last
          if params[field] == "true"
            @edit[:new][:events].push(event)   # Add event to array
          else
            @edit[:new][:events].delete(event) # Delete event from array
          end
        end
        @edit[:new][:events].uniq!
        @edit[:new][:events].sort!
      end
    end

    send_button_changes
  end

  def policy_get_all
    peca_get_all('policy', -> { get_view(MiqPolicy, :named_scope => [[:with_mode, @sb[:mode].downcase], [:with_towhat, @sb[:nodeid].camelize]]) })
  end

  def policies_node(mode, towhat)
    ["xx-#{mode.downcase}",
     "xx-#{mode.downcase}-#{towhat.camelize(:lower)}"].join("_")
  end

  def policy_node(policy)
    [policies_node(policy.mode, policy.towhat), "p-#{policy.id}"].join("_")
  end

  private

  def policy_build_edit_screen(edit_type = nil)
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    @policy = params[:id] ? MiqPolicy.find(params[:id]) : MiqPolicy.new                   # Get existing or new record
    @edit[:key] = "policy_edit__#{@policy.id || "new"}"
    @mode = params[:id] ? @policy.mode.capitalize : x_node.split("_").first.split("-").last
    @edit[:rec_id] = @policy.id || nil

    @edit[:typ] = edit_type                                                               # Remember edit type (basic/events/conditions)
    @edit[:policy_id] = @policy.id
    @edit[:new][:mode] = params[:id] ? @policy.mode : @mode.downcase                      # Get mode from record or folder
    @edit[:new][:description] = @policy.description
    @edit[:new][:active] = @policy.active.nil? ? true : @policy.active                    # Set active, default to true
    @edit[:new][:notes] = @policy.notes
    @edit[:new][:towhat] = @policy.id ? @policy.towhat : @sb[:folder].split('-').last.camelize # Set the towhat model

    case @edit[:typ]                  # Build fields based on what is being edited
    when "conditions"                 # Editing condition assignments
      @edit[:new][:conditions] = {}
      conditions = @policy.conditions # Get the condittions
      conditions.each { |c| @edit[:new][:conditions][c.description] = c.id } # Build a hash for the members list box

      @edit[:choices] = {}
      Condition.where(:towhat => @edit[:new][:towhat]).each { |c| @edit[:choices][c.description] = c.id } # Build a hash for the policies to choose from

      @edit[:new][:conditions].each_key { |key| @edit[:choices].delete(key) } # Remove any choices that are in the members list box
    when "events" # Editing event assignments
      @edit[:new][:events] = @policy.miq_event_definitions.collect { |e| e.id.to_s }.uniq.sort

      @edit[:allevents] = {}
      MiqPolicy.all_policy_events.each do |e|
        next if excluded_event?(e)

        @edit[:allevents][e.etype.description] ||= []
        @edit[:allevents][e.etype.description].push([_(e.description), e.id.to_s])
      end
    else # Editing basic information and policy scope
      build_expression(@policy, @edit[:new][:towhat])
    end

    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true                                       # Don't show flash msg or check boxes in Policies partial
    @in_a_form = true
    @edit[:current][:add] = true if @edit[:policy_id].nil? # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def excluded_event?(event)
    event.name.end_with?("compliance_check", "perf_complete")
  end

  def policy_get_all_folders
    @folders = %w[Compliance Control]
    @right_cell_text = _("All Policies")
    @right_cell_div = "policy_folders"
  end

  # Get information for a policy
  def policy_get_info(policy)
    @record = @policy = policy
    @right_cell_text = _("%{model} \"%{name}\"") % {
      :model => "#{@sb[:mode]} Policy",
      :name  => @policy.description
    }
    @right_cell_div = "policy_details"
    @policy_conditions = @policy.conditions
    @policy_events = @policy.miq_event_definitions
    @expression_table = @policy.expression.kind_of?(MiqExpression) ? exp_build_table(@policy.expression.exp) : nil

    if x_active_tree == :policy_tree
      @policy_profiles = @policy.memberof.sort_by { |pp| pp.description.downcase }
    elsif x_active_tree == :policy_profile_tree
      @sb[:mode] = @policy.mode
      @sb[:nodeid] = @policy.towhat
    end
  end
end
