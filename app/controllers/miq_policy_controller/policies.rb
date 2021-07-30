module MiqPolicyController::Policies
  extend ActiveSupport::Concern

  def policy_edit_cancel
    if params[:id]
      flash_msg = _("Edit of Policy \"%{name}\" was cancelled by the user") % {:name => session[:edit][:new][:description]}
    else
      flash_msg = _("Add of new Policy was cancelled by the user")
    end
    @edit = session[:edit] = nil # clean out the saved info
    session[:changed] = false
    javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
  end

  def policy_edit_reset
    @policy = params[:id] ? MiqPolicy.find(params[:id]) : MiqPolicy.new # Get existing or new record
    assert_privileges("miq_policy_#{@policy.id ? "edit" : "new"}")
    @in_a_form = true

    if @policy.read_only
      add_flash(_("This Policy is read only and cannot be modified"), :error)
      flash_to_session
      redirect_to(:action => @lastaction, :id => params[:id])
    end

    policy_build_edit_screen(session[:edit].try(:key?, :typ) ? session[:edit][:typ] : params[:typ])
    javascript_redirect(:action        => 'edit',
                        :id            => params[:id],
                        :flash_msg     => _("All changes have been reset"),
                        :flash_warning => true) if params[:button] == "reset"
  end

  def policy_edit_save
    assert_privileges("miq_policy_#{@policy.id ? "edit" : "new"}")
    policy = @policy.id.blank? ? MiqPolicy.new : MiqPolicy.find(@policy.id) # Get new or existing record
    policy.mode = @edit[:new][:mode]
    policy.updated_by = session[:userid]
    policy.towhat = @edit[:new][:towhat]
    policy.created_by = session[:userid] if @policy.id.blank?
    policy.description = @edit[:new][:description]
    policy.active = @edit[:new][:active]
    policy.notes = @edit[:new][:notes]
    policy.expression = @edit[:new][:expression]["???"] ? nil : MiqExpression.new(@edit[:new][:expression])

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

    AuditEvent.success(build_saved_audit(policy, @edit))
    if params[:button] == "save"
      flash_msg = _("Policy \"%{name}\" was saved") % {:name => @edit[:new][:description]}
    else
      flash_msg = _("Policy \"%{name}\" was added") % {:name => @edit[:new][:description]}
    end
    @edit = session[:edit] = nil # clean out the saved info
    session[:changed] = @changed = false
    javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
  end

  def policy_edit_move
    handle_selection_buttons(:conditions)
    @changed = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      page.replace('policy_conditions_div', :partial => 'miq_policy_edit_conditions')
      page << javascript_for_miq_button_visibility(@changed)
      page << "miqSparkle(false);"
    end
  end

  def policy_edit_load_policy
    # Load @edit/vars for other buttons
    id = params[:id] || "new"
    return unless load_edit("miq_policy_edit__#{id}")
    @edit[:policy_id] ? MiqPolicy.find_by(:id => @edit[:policy_id]) : MiqPolicy.new
  end

  def miq_policy_edit
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
  def copy
    assert_privileges("miq_policy_copy")
    @_params[:id] ||= find_checked_items[0]
    policy = MiqPolicy.find(params[:id])
    new_desc = truncate("Copy of #{policy.description}", :length => 255, :omission => "")
    if MiqPolicy.find_by(:description => new_desc)
      add_flash(_("Policy \"%{name}\" already exists") % {:name => new_desc}, :error)
    else
      new_pol = policy.copy(:description => new_desc, :created_by => session[:userid], :read_only => nil)
      AuditEvent.success(:event        => "miqpolicy_copy",
                         :target_id    => new_pol.id,
                         :target_class => "MiqPolicy",
                         :userid       => session[:userid],
                         :message      => "New Policy ID %{new_id} was copied from Policy ID %{old_id}" %
                                          {:new_id => new_pol.id, :old_id => policy.id})
      add_flash(_("Policy \"%{name}\" was added") % {:name => new_desc})
    end
    flash_to_session
    redirect_to(:action => @lastaction, :id => params[:id])
  end

  def policy_field_changed
    return unless load_edit("miq_policy_edit__#{params[:id]}")

    case @edit[:typ]
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
    else
      @edit[:new][:description] = params[:description].presence if params[:description]
      @edit[:new][:notes] = params[:notes].presence if params[:notes]
      @edit[:new][:active] = (params[:active] == "1") if params.key?(:active)
      @edit[:new][:mode] = params[:mode] if params[:mode]
      params[:towhat] ||= 'Vm'
      if params[:towhat]
        @edit[:new][:towhat] = params[:towhat]
        @policy = @edit[:rec_id] ? MiqPolicy.find_by(:id => @edit[:rec_id]) : MiqPolicy.new
        build_expression(@policy, params[:towhat])
      end
    end
    send_button_changes
  end

  def miq_policy_edit_events
    assert_privileges('miq_policy_events_assignment')
    case params[:button]
    when "cancel"
      @sb[:action] = @edit = nil
      flash_msg = _("Edit of Policy's Event Assignment cancelled by user")
      session[:changed] = false
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
    when "reset", nil # Reset or first time in
      @in_a_form = true
      @policy = MiqPolicy.find_by(:id => params[:id]) # Get existing record
      policy_build_edit_screen("events")
      javascript_redirect(:action        => 'miq_policy_edit_events',
                          :id            => params[:id],
                          :flash_msg     => _("All changes have been reset"),
                          :flash_warning => true) if params[:button] == "reset"
    when "save"
      # Reload @edit/vars for other buttons
      @policy = policy_edit_load_policy
      @policy.sync_events(@edit[:new][:events].collect { |e| MiqEventDefinition.find(e) }) if @edit[:typ] == "events"
      AuditEvent.success(build_saved_audit(@policy, @edit))
      flash_msg = _("Event Assignment for Policy was saved")
      @sb[:action] = @edit = nil
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
    end
  end

  def miq_policy_edit_conditions
    assert_privileges('miq_policy_conditions_assignment')
    case params[:button]
    when "cancel"
      @sb[:action] = @edit = nil
      flash_msg = _("Edit of Policy's Condition Assignment cancelled by user")
      session[:changed] = false
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
    when "reset", nil # Reset or first time in
      @in_a_form = true
      @policy = MiqPolicy.find_by(:id => params[:id]) # Get existing record
      policy_build_edit_screen("conditions")
      javascript_redirect(:action        => 'miq_policy_edit_conditions',
                          :id            => params[:id],
                          :flash_msg     => _("All changes have been reset"),
                          :flash_warning => true) if params[:button] == "reset"
    when "save"
      @policy = policy_edit_load_policy
      mems = @edit[:new][:conditions].invert # Get the ids from the member list box
      @policy.conditions.collect { |pc| pc }.each { |c| @policy.conditions.delete(c) unless mems.key?(c.id) } # Remove any conditions no longer in members
      mems.each_key { |m| @policy.conditions.push(Condition.find(m)) unless @policy.conditions.collect(&:id).include?(m) } # Add any new conditions
      if !@policy.valid? || @flash_array || !@policy.save
        @policy.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        javascript_flash
        return
      end

      AuditEvent.success(build_saved_audit(@policy, @edit))
      flash_msg = _("Policy \"%{name}\" was saved") % {:name => @policy.description}
      @edit = session[:edit] = nil # clean out the saved info
      session[:changed] = @changed = false
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
    end
  end

  private

  def policy_build_edit_screen(edit_type = nil)
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "miq_policy_edit__#{@policy.id || "new"}"
    @edit[:rec_id] = @policy.id || nil

    @edit[:typ] = edit_type                                                               # Remember edit type (basic/events/conditions)
    @edit[:policy_id] = @policy.id
    @edit[:new][:mode] = @policy.mode
    @edit[:new][:description] = @policy.description
    @edit[:new][:active] = @policy.active.nil? ? true : @policy.active                    # Set active, default to true
    @edit[:new][:notes] = @policy.notes
    @edit[:new][:towhat] = @policy.towhat

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
    else
      build_expression(@policy, @edit[:new][:towhat]) if @edit[:new][:towhat]
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

end
