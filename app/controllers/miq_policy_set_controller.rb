class MiqPolicySetController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  def title
    @title = _("Policy Profiles")
  end

  def new
    profile_reset_or_set
  end

  def edit
    @_params[:pressed] ||= 'miq_policy_set_edit'
    case params[:button]
    when "cancel"
      profile_cancel
    when "save", "add"
      profile_save_add
    when "reset", nil # displaying edit from for actions: new, edit or copy
      @_params[:id] ||= find_checked_items[0]
      @redirect_id = params[:id] if params[:id]
      @refresh_partial = "edit"
      profile_reset_or_set
    end
  end

  def form_field_changed
    return unless load_edit("profile_edit__#{params[:id]}")
    @profile = @edit[:profile_id] ? MiqPolicySet.find(@edit[:profile_id]) : MiqPolicySet.new
    @edit[:new][:description] = params[:description].presence if params[:description]
    @edit[:new][:notes] = params[:notes].presence if params[:notes]
    if %w[move_right move_left move_allleft].include?(params[:button])
      handle_selection_buttons(:policies)
      @changed = (@edit[:new] != @edit[:current])
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page.replace_html("profile_info_div", :partial => "profile_details") unless @flash_errors
      end
    else
      send_button_changes
    end
  end

  private

  def profile_reset_or_set
    assert_privileges('miq_policy_set_edit') if params[:button] == "reset"
    @profile = params[:id] ? MiqPolicySet.find(params[:id]) : MiqPolicySet.new
    @in_a_form = true
    profile_build_edit_screen
    javascript_redirect(:action        => 'edit',
                        :id            => params[:id],
                        :flash_msg     => _("All changes have been reset"),
                        :flash_warning => true) if params[:button] == "reset"
  end

  def profile_cancel
    @profile = MiqPolicySet.find(session[:edit][:profile_id]) if session[:edit] && session[:edit][:profile_id]
    if @profile.blank?
      flash_msg = _("Add of new Policy Profile was cancelled by the user")
    else
      flash_msg = _("Edit of Policy Profile \"%{name}\" was cancelled by the user") % {:name => @profile.description}
    end
    @edit = session[:edit] = nil # clean out the saved info
    session[:changed] = false
    javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
  end

  def profile_save_add
    assert_privileges("profile_#{params[:id] ? "edit" : "new"}")
    return unless load_edit("profile_edit__#{params[:id] ? "#{params[:id]}" : "new"}")
    add_flash(_("Policy Profile must contain at least one Policy"), :error) if @edit[:new][:policies].length.zero? # At least one member is required

    profile = params[:id].blank? ? MiqPolicySet.new : MiqPolicySet.find_by(:id => params[:id]) # Get new or existing record
    profile.description = @edit[:new][:description]
    profile.notes = @edit[:new][:notes]
    if profile.valid? && !@flash_array && profile.save
      policies = profile.members               # Get the sets members
      current = []
      policies.each { |p| current.push(p.id) } # Build an array of the current policy ids
      mems = @edit[:new][:policies].invert     # Get the ids from the member list box
      begin
        policies.each { |c| profile.remove_member(c) unless mems.include?(c.id) } # Remove any policies no longer in the members list box
        mems.each_key { |m| profile.add_member(MiqPolicy.find(m)) unless current.include?(m) } # Add any policies not in the set
      rescue => bang
        add_flash(_("Error during 'Policy Profile %{params}': %{messages}") %
                    {:params => params[:button], :messages => bang.message}, :error)
      end
      AuditEvent.success(build_saved_audit(profile, @edit))
      if params[:button] == "save"
        flash_msg = _("Policy Profile \"%{name}\" was saved") % {:name => @edit[:new][:description]}
      else
        flash_msg = _("Policy Profile \"%{name}\" was added") % {:name => @edit[:new][:description]}
      end
      @edit = session[:edit] = nil # clean out the saved info
      session[:changed] = @changed = false
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
    else
      profile.errors.each do |field, msg|
        add_flash("#{field.to_s.capitalize} #{msg}", :error)
      end
      javascript_flash
    end
  end

  def profile_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    @profile = params[:id] ? MiqPolicySet.find(params[:id]) : MiqPolicySet.new # Get existing or new record
    @edit[:key] = "profile_edit__#{@profile.id || "new"}"
    @edit[:rec_id] = @profile.id || nil

    @edit[:profile_id] = @profile.id
    @edit[:new][:description] = @profile.description
    @edit[:new][:notes] = @profile.notes

    @edit[:new][:policies] = {}
    policies = @profile.members # Get the member sets
    policies.each { |p| @edit[:new][:policies][ui_lookup(:model => p.towhat) + " #{p.mode.capitalize}: " + p.description] = p.id } # Build a hash for the members list box

    @edit[:choices] = {}
    MiqPolicy.all.each do |p|
      @edit[:choices][ui_lookup(:model => p.towhat) + " #{p.mode.capitalize}: " + p.description] = p.id # Build a hash for the policies to choose from
    end

    @edit[:new][:policies].each_key do |key|
      @edit[:choices].delete(key) # Remove any policies that are in the members list box
    end

    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true
    @in_a_form = true
    @edit[:current][:add] = true if @edit[:profile_id].blank? # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def get_session_data
    @title = _("Policy Profiles")
    @layout = "miq_policy_set"
    @lastaction = session[:miq_policy_set_lastaction]
    @display = session[:miq_policy_set_display]
    @current_page = session[:miq_policy_set_current_page]
  end

  def set_session_data
    super
    session[:layout]                      = @layout
    session[:miq_policy_set_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        {:title => _('Policy Profiles'), :url => controller_url},
      ].compact,
      :record_title => :description,
    }
  end

  menu_section :con
end
