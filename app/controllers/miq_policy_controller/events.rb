module MiqPolicyController::Events
  extend ActiveSupport::Concern

  def miq_event_edit
    assert_privileges("miq_event_edit")
    case params[:button]
    when "cancel"
      @sb[:action] = @edit = nil
      flash_msg = _("Edit Event cancelled by user")
      session[:changed] = false
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
    when "reset", nil # Reset or first time in
      @_params[:id] ||= find_checked_items[0]
      event_build_edit_screen
      javascript_redirect(:action        => 'miq_event_edit',
                          :id            => params[:id],
                          :flash_msg     => _("All changes have been reset"),
                          :flash_warning => true) if params[:button] == "reset"
      return
    end

    # Reload @edit/vars for other buttons
    id = params[:id] || "new"
    return unless load_edit("event_edit__#{id}")

    @event = @edit[:event_id] ? MiqEventDefinition.find(@edit[:event_id]) : MiqEventDefinition.new
    @policy = MiqPolicy.find_by(:id => @edit[:new][:policy_id])

    case params[:button]
    when "save"
      event = MiqEventDefinition.find(@event.id) # Get event record
      action_list = @edit[:new][:actions_true].collect { |a| [MiqAction.find(a.last), {:qualifier => :success, :synchronous => a[1]}] } +
                    @edit[:new][:actions_false].collect { |a| [MiqAction.find(a.last), {:qualifier => :failure, :synchronous => a[1]}] }
      add_flash(_("At least one action must be selected to save this Policy Event"), :error) if action_list.blank?
      if @flash_array
        javascript_flash
        return
      end

      @policy.replace_actions_for_event(event, action_list)
      AuditEvent.success(build_saved_audit(event, @edit))
      flash_msg = _("Actions for Policy Event \"%{events}\" were saved") % {:events => event.description}
      @sb[:action] = @edit = nil
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
    when "true_right", "true_left", "true_allleft", "true_up", "true_down", "true_sync", "true_async"
      handle_selection_buttons(:actions_true, :members_chosen_true, :choices_true, :choices_chosen_true)
      @changed = session[:changed] = (@edit[:new] != @edit[:current])
    when "false_right", "false_left", "false_allleft", "false_up", "false_down", "false_sync", "false_async"
      handle_selection_buttons(:actions_false, :members_chosen_false, :choices_false, :choices_chosen_false)
      @changed = session[:changed] = (@edit[:new] != @edit[:current])
    end

    return if performed?

    if flash_errors?
      javascript_flash
      return
    else
      render :update do |page|
        page << javascript_prologue
        page.replace('event_edit_div', :partial => 'event_edit')
        page << javascript_for_miq_button_visibility(@changed)
        page << "miqSparkle(false);"
      end
    end
  end

  private

  def event_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    @policy = MiqPolicy.find_by(:id => params[:id]) # Get the policy above this event
    @edit[:new][:policy_id] = @policy.id
    @edit[:events] = []
    event_definitions = @policy.miq_event_definitions
    event_definitions.each do |ev|
      @edit[:events].push([ev.description, ev.id])
    end
    @event = event_definitions.first if event_definitions.count == 1
    @edit[:event_id] = @event.id if @event
    @edit[:key] = "event_edit__#{@policy.id || "new"}"
    @edit[:rec_id] = @policy.id || nil
    event_build_action_values if @event
    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true
    @in_a_form = true
    @edit[:current][:add] = true if @edit[:rec_id].nil? # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def event_build_action_values
    @edit[:event_id] = params[:event_id] if params[:event_id]
    @event ||= MiqEventDefinition.find_by(:id => @edit[:event_id])
    @edit[:new][:actions_true] = []
    @policy ||= MiqPolicy.find_by(:id => @edit[:new][:policy_id]) # Get the policy above this event

    @policy.actions_for_event(@event, :success).each do |as| # Build true actions array
      sync = as.synchronous.nil? || as.synchronous
      @edit[:new][:actions_true].push([(sync ? "(S) " : "(A) ") + as.description, sync, as.id])
    end

    @edit[:new][:actions_false] = []
    @policy.actions_for_event(@event, :failure).each do |af| # Build false actions array
      sync = af.synchronous.nil? || af.synchronous
      @edit[:new][:actions_false].push([(sync ? "(S) " : "(A) ") + af.description, sync, af.id])
    end

    @edit[:choices_true] = {} # Build a new choices list for true actions
    MiqAction.allowed_for_policies(@policy.mode).each do |a| # Build a hash for the true choices
      @edit[:choices_true][a.description] = a.id
    end
    @edit[:new][:actions_true].each do |as|
      @edit[:choices_true].delete(as[0].slice(4..-1)) # Remove any choices already in the list (desc is first element, but has "(x) " in front)
    end

    @edit[:choices_false] = {} # Build a new choices list for false actions
    MiqAction.allowed_for_policies(@policy.mode).each do |a| # Build a hash for the false choices
      @edit[:choices_false][a.description] = a.id
    end
    @edit[:new][:actions_false].each do |as|
      @edit[:choices_false].delete(as[0].slice(4..-1)) # Remove any choices already in the list (desc is first element, but has "(x) " in front)
    end

    @edit[:current] = copy_hash(@edit[:new])
  end
end
