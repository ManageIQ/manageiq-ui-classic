class MiqRequestController < ApplicationController
  include Mixins::GenericSessionMixin

  before_action :check_privileges, :except => :post_install_callback
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  helper ProvisionCustomizeHelper

  def index
    #   show_list
    #   render :action=>"show_list"
    @request_tab = params[:typ] if params[:typ] # set this to be used to identify which Requests subtab was clicked
    redirect_to :action => 'show_list'
  end

  # handle buttons pressed on the button bar
  def button
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh
    @refresh_div = "main_div" # Default div for button.rjs to refresh

    case params[:pressed]
    when 'miq_request_delete' then deleterequests
    when 'miq_request_edit'   then request_edit
    when 'miq_request_copy'   then request_copy
    when 'miq_request_reload' then handle_request_reload
    else                           javascript_flash(:text => _('Button not yet implemented'), :severity => :error)
    end
  end

  def request_edit
    assert_privileges("miq_request_edit")
    provision_request = MiqRequest.find(params[:id])
    if provision_request.workflow_class || provision_request.kind_of?(MiqProvisionConfiguredSystemRequest)
      request_edit_settings(provision_request)
      handle_request_edit_copy_redirect
    else
      session[:checked_items] = provision_request.options[:src_ids]
      @refresh_partial = "reconfigure"
      @_params[:controller] = "vm"
      reconfigurevms
    end
  end

  def request_copy
    assert_privileges("miq_request_copy")
    provision_request = MiqRequest.find(params[:id])
    @refresh_partial = "prov_copy"
    request_settings_for_edit_or_copy(provision_request)
    handle_request_edit_copy_redirect
  end

  def page_display_options
    if @sb[:prov_options] && @sb[:prov_options].key?(request_tab_type.to_sym)
      {:named_scope => prov_scope(@sb[:def_prov_options][request_tab_type.to_sym])}
    else
      {}
    end
  end

  # Show the main Requests list view
  def show_list
    @breadcrumbs = []
    bc_name = _("Requests")
    @request_tab = params[:typ] if params[:typ] # set this to be used to identify which Requests subtab was clicked
    @layout = layout_from_tab_name(@request_tab)

    drop_breadcrumb(:name => bc_name, :url => "/miq_request/show_list?typ=#{@request_tab}")
    @lastaction = "show_list"
    @gtl_url = "/show_list"

    @settings.store_path(:views, :miqrequest, params[:type]) if params[:type]
    @gtl_type = settings(:views, :miqrequest)

    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, PERPAGE_TYPES[@gtl_type], @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:request_sortcol].nil? ? 0 : session[:request_sortcol].to_i
    @sortdir = session[:request_sortdir].nil? ? "ASC" : session[:request_sortdir]
    @listicon = "miq_request"
    @no_checkboxes = true # Don't show checkboxes, read_only
    resource_type = request_tab_type # storing resource type in local variable so dont have to call method everytime
    kls = @layout == "miq_request_ae" ? AutomationRequest : MiqRequest
    gv_options = page_display_options
    @view, @pages = get_view(kls, gv_options)
    @sb[:prov_options] ||= {}
    @sb[:def_prov_options] ||= {}
    @sb[:prov_options][:resource_type] = resource_type.to_sym # storing current resource type

    prov_set_default_options if !@sb[:prov_options] || (@sb[:prov_options] && !@sb[:prov_options].key?(resource_type.to_sym)) # reset default options if requests sub tab has changed

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:request_sortcol] = @sortcol
    session[:request_sortdir] = @sortdir

    {:view => @view, :pages => @pages}
  end

  def show
    identify_request
    return if record_no_longer_exists?(@miq_request)
    @display = params[:display] || "main" unless pagination_or_gtl_request?

    if @display == "main"
      prov_set_show_vars
    elsif @display == "miq_provisions"
      @showtype = "miq_provisions"
      @listicon = "miq_request"
      @no_checkboxes = true
      @showlinks = true
      @view, @pages = get_view(MiqProvision, :named_scope => [[:with_miq_request_id, @miq_request.id]]) # Get all requests
      drop_breadcrumb(:name => _("Provisioned VMs [%{description}]") % {:description => @miq_request.description},
                      :url  => "/miq_request/show/#{@miq_request.id}?display=#{@display}")
    end

    @lastaction = "show"
  end

  # Stamp a request with approval or denial
  def stamp
    assert_privileges("miq_request_approval")
    if params[:button] == "cancel"
      if (session[:edit] && session[:edit][:stamp_typ]) == "a"
        add_flash(_("Request approval was cancelled by the user"))
      else
        add_flash(_("Request denial was cancelled by the user"))
      end
      flash_to_session
      @edit = nil
      javascript_redirect :action => @lastaction, :id => session[:edit][:request].id
    elsif params[:button] == "submit"
      return unless load_edit("stamp_edit__#{params[:id]}", "show")
      stamp_request = MiqRequest.find(@edit[:request].id)         # Get the current request record
      if @edit[:stamp_typ] == "approve"
        stamp_request.approve(current_user, @edit[:reason])
      else
        stamp_request.deny(current_user, @edit[:reason])
      end
      add_flash(_("Request \"%{name}\" was %{task}") % {:name => stamp_request.description, :task => (session[:edit] && session[:edit][:stamp_typ]) == "approve" ? "approved" : "denied"})
      flash_to_session
      @edit = nil
      javascript_redirect :action => "show_list"
    else # First time in, set up @edit hash
      identify_request
      @edit = {}
      @edit[:dialog_mode] = :review
      @edit[:request] = @miq_request
      @edit[:key] = "stamp_edit__#{@miq_request.id}"
      # set approve/deny based upon params[:typ] value
      @edit[:stamp_typ] = params[:typ] == 'a' ? 'approve' : 'deny'
      show
      if @edit[:stamp_typ] == "approve"
        drop_breadcrumb(:name => _("Request Approval"), :url => "/miq_request/stamp")
      else
        drop_breadcrumb(:name => _("Request Denial"), :url => "/miq_request/stamp")

      end
      render :action => "show"
    end
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def stamp_field_changed
    return unless load_edit("stamp_edit__#{params[:id]}", "show")
    @edit[:reason] = params[:reason] if params[:reason]
    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(@edit[:reason].present?)
    end
  end

  def prov_copy
    org_req = MiqRequest.where(:id => params[:req_id].to_i).first
    req = MiqRequest.new(
      :approval_state => 'pending_approval',
      :description    => org_req.description,
      :requester      => current_user,
      :type           => org_req.type,
      :created_on     => org_req.created_on,
      :updated_on     => org_req.updated_on,
      :options        => org_req.options.except(:requester_group),
    )

    prov_set_form_vars(req) # Set vars from existing request
    # forcing submit button to stay on for copy request, setting a key in current hash so new and current are different,
    # couldn't set this in new hash becasue that's being set by model
    @edit[:current][:description] = _("Copy of %{description}") % {:description => org_req.description}
    session[:changed] = true # Turn on the submit button
    drop_breadcrumb(:name => _("Copy of %{typ} Request") % {:typ => org_req.request_type_display})
    @in_a_form = true
    render :action => "prov_edit"
  end

  # To handle Continue button
  def prov_continue
    if params[:button] == "continue" # Continue the request from the workflow with the new options
      id = params[:id] ? params[:id] : "new"
      return unless load_edit("prov_edit__#{id}", "show_list")
      @edit[:wf].continue_request(@edit[:new])    # Continue the workflow with new field values based on options
      @edit[:wf].init_from_dialog(@edit[:new])    # Create a new provision workflow for this edit session
      @edit[:buttons] = @edit[:wf].get_buttons
      @edit[:wf].get_dialog_order.each do |d|                           # Go thru all dialogs, in order that they are displayed
        @edit[:wf].get_all_fields(d).each do |_f, field|                # Go thru all field
          if field[:error].present?
            @error_div ||= "#{d}_div"
            add_flash(field[:error], :error)
          end
        end
      end
      # setting active tab to first visible tab
      @edit[:wf].get_dialog_order.each do |d|
        if @edit[:wf].get_dialog(d)[:display] == :show
          @edit[:new][:current_tab_key] = d
          @tabactive = d # Use JS to update the display
          break
        end
      end
      render :update do |page|
        page << javascript_prologue
        if @error_div
          page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        else
          page.replace("prov_wf_div", :partial => "prov_wf")
        end
        page.replace("buttons_div", :partial => "miq_request/prov_form_buttons")
      end
    end
  end

  def prov_load_tab
    if @options && @options[:current_tab_key] == :purpose # Need to build again for purpose tab
      fld = @options[:wf].kind_of?(MiqHostProvisionWorkflow) ? "tag_ids" : "vm_tags"
      build_tags_tree(@options[:wf], @options[fld.to_s.to_sym], false)
    end
    # need to build host list view, to display on show screen
    @options[:host_sortdir] = "ASC"
    @options[:host_sortcol] = "name"
    # only build host grid if that field is visible/exists in dialog
    if @options[:wf].get_field(:src_host_ids, :service).present? ||
       @options[:wf].get_field(:placement_host_name, :environment).present?
      build_host_grid(@options[:wf].allowed_hosts, @options[:host_sortdir], @options[:host_sortcol])
    end
    render :update do |page|
      page << javascript_prologue
      page.replace_html(
        @options[:current_tab_key],
        :partial => dialog_partial_for_workflow,
        :locals  => {:wf => @options[:wf], :dialog => @options[:current_tab_key]}
      )
      # page << javascript_show("hider_#{@options[:current_tab_key].to_s}_div")
      page << "miqSparkle(false);"
    end
  end

  WORKFLOW_METHOD_WHITELIST = {'retrieve_ldap' => :retrieve_ldap}.freeze

  def retrieve_email
    @edit = session[:edit]
    begin
      method = WORKFLOW_METHOD_WHITELIST[params[:field]]
      @edit[:wf].send(method, @edit[:new]) unless method.nil?
    rescue => bang
      add_flash(_("Error retrieving LDAP info: %{error_message}") % {:error_message => bang.message}, :error)
      javascript_flash
    else
      render :update do |page|
        page << javascript_prologue
        page.replace_html("requester_div", :partial => "shared/views/prov_dialog",
                                           :locals  => {:wf => @edit[:wf], :dialog => :requester})
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      end
    end
  end

  # Gather any changed options
  def prov_change_options
    resource_type = request_tab_type.to_sym
    @sb[:def_prov_options][resource_type][:user_choice] = params[:user_choice] if params[:user_choice]
    @sb[:def_prov_options][resource_type][:type_choice] = params[:type_choice] if params[:type_choice]
    @sb[:def_prov_options][resource_type][:time_period] = params[:time_period].to_i if params[:time_period]
    @sb[:def_prov_options][resource_type][:reason_text] = params[:reason_text] if params[:reason_text] # && params[:reason][:text] != ""
    res_type = @sb[:prov_options][resource_type]
    res_type[:states].sort.each do |(state, _display_name)|
      if params["state_choice__#{state}"] == "1"
        @sb[:def_prov_options][resource_type][:applied_states].push(state) unless @sb[:def_prov_options][resource_type][:applied_states].include?(state)
      elsif params["state_choice__#{state}"] == "null"
        @sb[:def_prov_options][resource_type][:applied_states].delete(state)
      end
    end

    applied_states_blank = @sb[:def_prov_options][resource_type][:applied_states].blank?
    add_flash(_("At least one status must be selected"), :warning) if applied_states_blank

    render :update do |page|
      page << javascript_prologue
      if applied_states_blank
        # Disable buttons due to no filters being selected
        page << javascript_for_miq_button_visibility(false)
      else
        # Options have changed?
        page << javascript_for_miq_button_visibility(res_type != @sb[:def_prov_options][resource_type])
      end
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
    end
  end

  # Refresh the display with the chosen filters
  def prov_button
    @edit = session[:edit]
    if params[:button] == "apply"
      @sb[:prov_options][@sb[:prov_options][:resource_type]] = copy_hash(@sb[:def_prov_options][@sb[:prov_options][:resource_type]])  # Copy the latest changed options
    elsif params[:button] == "reset"
      @sb[:def_prov_options][@sb[:prov_options][:resource_type]] = copy_hash(@sb[:prov_options][@sb[:prov_options][:resource_type]])  # Reset to the saved options
    elsif params[:button] == "default"
      prov_set_default_options
    end
    show_list

    options = {"additionalOptions" => page_display_options}
    render :update do |js|
      js << javascript_prologue
      js << "sendDataWithRx({refreshData: {name: \"reportDataController\"}, data: #{options.to_json}});"
    end
  end

  def post_install_callback
    MiqRequestTask.post_install_callback(params["task_id"]) if params["task_id"]
    head :ok
  end

  # Caution: The params[:typ] argument needs to match value from ?typ=VALUE
  # from app/presenters/menu/default_menu.rb
  #   Example: '/miq_request?typ=service' --> "'service'".
  # The returned value needs to be equal to the first argument to Menu::Section.new(...)
  #   Example:  Menu::Section.new(:clo, N_("Clouds"), 'fa fa-plus', [ ... --> ":clo"
  def menu_section_id(parms)
    case parms[:typ]
    when 'ae'      then :automate
    when 'service' then :svc
    when 'host'    then :inf
    end
  end

  private

  def replace_gtl
    render :update do |page|
      page << javascript_prologue
      page.replace('gtl_div', :partial => 'layouts/gtl', :locals => {:no_flash_div => true})
    end
  end

  def handle_request_edit_copy_redirect
    javascript_redirect :controller     => @redirect_controller,
                        :action         => @refresh_partial,
                        :id             => @redirect_id,
                        :prov_type      => @prov_type,
                        :req_id         => @req_id,
                        :org_controller => @org_controller,
                        :prov_id        => @prov_id
  end

  def handle_request_reload
    if @display == "main" && params[:id].present?
      show
      render :update do |page|
        page << javascript_prologue
        page.replace("request_div", :partial => "miq_request/request")
        page << javascript_reload_toolbars
      end
    elsif @display == "miq_provisions"
      show
      replace_gtl
    else
      show_list
      replace_gtl
    end
  end

  def request_tab_type
    case @layout
    when "miq_request_ae"                        then "AutomateRequest"
    when "miq_request_configured_system"         then "MiqProvisionConfiguredSystemRequest"
    when "miq_request_host"                      then "MiqHostProvisionRequest"
    when "miq_request_vm"                        then "MiqProvisionRequest"
    end
  end

  # Create a condition from the passed in options
  def prov_scope(opts)
    scope = []
    # Request date (created since X days ago)
    scope << [:created_recently, opts[:time_period].to_i] if opts[:time_period].present?
    # Select requester user across regions
    scope << [:with_requester, current_user.id] unless is_approver
    scope << [:with_requester, opts[:user_choice]] if opts[:user_choice] && opts[:user_choice] != "all"

    scope << [:with_approval_state, opts[:applied_states]] if opts[:applied_states].present?
    scope << [:with_type, MiqRequest::MODEL_REQUEST_TYPES[model_request_type_from_layout].keys]
    scope << [:with_request_type, opts[:type_choice]] if opts[:type_choice] && opts[:type_choice] != "all"
    scope << [:with_reason_like, opts[:reason_text]] if opts[:reason_text].present?

    scope
  end

  def model_request_type_from_layout
    case @layout
    when "miq_request_ae"   then :Automate
    when "miq_request_host" then :Infrastructure
    else                         :Service
    end
  end

  def request_types_for_dropdown
    MiqRequest::MODEL_REQUEST_TYPES[model_request_type_from_layout].values.reduce({}) do |hash, item|
      hash.merge(item) { |_key, val| _(val) }
    end
  end

  # Set all task options to default
  def prov_set_default_options
    resource_type = request_tab_type
    opts = @sb[:prov_options][resource_type.to_sym] = {}
    opts[:states] = PROV_STATES.map { |k, v| [k, _(v)] }.to_h
    opts[:reason_text] = nil
    opts[:types] = request_types_for_dropdown

    opts[:users] = Rbac::Filterer.filtered(MiqRequest.where(
      :type       => MiqRequest::MODEL_REQUEST_TYPES[model_request_type_from_layout].keys,
      :created_on => (30.days.ago.utc)..(Time.now.utc)
    )).each_with_object({}) do |r, h|
      h[r.requester_id] = if r.requester.nil?
                            (_("%{name} (no longer exists)") % {:name => r.requester_name})
                          else
                            r.requester_name
                          end
    end

    unless is_approver
      username = current_user.name
      opts[:users] = opts[:users].value?(username) ? {opts[:users].key(username) => username} : {}
    end
    opts[:applied_states] = opts[:states].collect { |s| s[0] }
    opts[:type_choice] = "all"
    opts[:user_choice] ||= "all"
    opts[:time_period] ||= 7
    @sb[:def_prov_options][resource_type.to_sym] = {}
    @sb[:prov_options][resource_type.to_sym] = @sb[:def_prov_options][resource_type.to_sym] = copy_hash(opts)
  end

  # Find the request that was chosen
  def identify_request
    klass = @layout == "miq_request_ae" ? AutomationRequest : MiqRequest
    @miq_request = @record = identify_record(params[:id], klass)
  end

  def is_approver
    # TODO: this should be current_user
    User.current_user.role_allows?(:identifier => 'miq_request_approval')
  end

  # Delete all selected or single displayed action(s)
  def deleterequests
    assert_privileges("miq_request_delete")

    miq_requests = find_records_with_rbac(MiqRequest, checked_or_params)
    if miq_requests.empty?
      add_flash(_("No Requests were selected for deletion"), :error)
    else
      destroy_requests(miq_requests)
    end

    unless flash_errors?
      if @lastaction == "show_list" # showing a list
        add_flash(_("The selected Requests were deleted"))
      else
        @single_delete = true
        add_flash(_("The selected Request was deleted"))
      end
    end


    if @flash_array.present?
      flash_to_session
      javascript_redirect :action => 'show_list'
    else
      show_list
      replace_gtl
    end
  end

  def destroy_requests(miq_requests)
    miq_requests.each do |miq_request|
      request_name = miq_request.description
      audit = {:event        => "MiqRequest_record_delete",
               :message      => "[#{request_name}] Record deleted",
               :target_id    => miq_request.id,
               :target_class => "MiqRequest",
               :userid       => session[:userid]}
      begin
        miq_request.destroy
      rescue => bang
        add_flash(_("Request \"%{name}\": Error during 'destroy': %{message}") %
                      {:name    => request_name,
                       :message => bang.message},
                  :error)
      else
        AuditEvent.success(audit)
        add_flash(_("Request \"%{name}\": Delete successful") % {:name => request_name})
      end
    end
  end

  def request_settings_for_edit_or_copy(provision_request)
    @org_controller = provision_request.originating_controller
    @redirect_controller = "miq_request"
    @req_id = provision_request.id
    @prov_type = provision_request.resource_type
    @prov_id = provision_request.options[:src_configured_system_ids]
  end

  def request_edit_settings(provision_request)
    @refresh_partial = "prov_edit"
    request_settings_for_edit_or_copy(provision_request)
  end

  def get_session_data
    super
    @title        = _("Requests")
    @request_tab  = session[:request_tab] if session[:request_tab]
    @layout       = layout_from_tab_name(@request_tab)
    @options      = session[:prov_options]
  end

  def set_session_data
    super
    session[:edit]                 = @edit unless @edit.nil?
    session[:request_tab]          = @request_tab unless @request_tab.nil?
    session[:prov_options]         = @options if @options
  end
end
