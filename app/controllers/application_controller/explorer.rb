# Explorer generic methods included in application.rb
module ApplicationController::Explorer
  extend ActiveSupport::Concern

  def build_replaced_trees(replace_trees, valid_values)
    return [] unless replace_trees
    valid_values.find_all { |tree| replace_trees.include?(tree) }
                .collect { |tree| try_build_tree(tree) }
                .compact
  end

  def replace_search_box(presenter, locals = {})
    presenter.replace(:adv_searchbox_div, r[:partial => 'layouts/x_adv_searchbox', :locals => locals])
    presenter.replace(:advsearchModal, r[:partial => 'layouts/adv_search'])
  end

  def try_build_tree(tree_symbol)
    # Legacy support for build_*_tree methods
    # FIXME: delete this after all of them were converted (remaining: build_reports_tree)
    method_name = :"build_#{tree_symbol}_tree"
    if respond_to?(method_name, true)
      method(method_name).call
    else
      features.find { |f| f.name == tree_symbol }.try(:build_tree, @sb)
    end
  end

  def x_history
    self.x_node = data_for_breadcrumbs[data_for_breadcrumbs.length - 2][:key]
    params[:id] = parse_nodetype_and_id(x_node).last
    params[:id].nil? && 'root'.eql?(params[:id]) ? show : tree_select
  end

  # FIXME: the code below has to be converted into proper actions called though
  # proper routes, this is just a small step to fix the current situation
  X_BUTTON_ALLOWED_ACTIONS = {
    # group 1
    'check_compliance' => :s1, 'collect_running_processes' => :s1, 'delete'              => :s1,
    'snapshot_delete'  => :s1, 'snapshot_delete_all' => :s1,
    'refresh'          => :s1, 'scan'                      => :s1, 'guest_shutdown'      => :s1,
    'guest_restart'    => :s1, 'retire_now'                => :s1, 'snapshot_revert'     => :s1,
    'start'            => :s1, 'stop'                      => :s1, 'suspend'             => :s1,
    'reset'            => :s1, 'terminate'                 => :s1, 'pause'               => :s1,
    'shelve'           => :s1, 'shelve_offload'            => :s1, 'chargeback'          => :s1,
    'foreman_pause'    => :s1, 'foreman_resume'            => :s1, 'manager_pause'       => :s1,
    'manager_resume'   => :s1,

    # group 2
    'clone'        => :s2, 'compare'          => :s2, 'drift'           => :s2,
    'edit'         => :s2, 'evm_relationship' => :s2, 'migrate'         => :s2,
    'ownership'    => :s2, 'policy_sim'       => :s2, 'protect'         => :s2,
    'publish'      => :s2, 'reconfigure'      => :s2, 'miq_request_new' => :s2,
    'retire'       => :s2, 'right_size'       => :s2, 'snapshot_add'    => :s2,
    'tag'          => :s2, 'timeline'         => :s2, 'resize'          => :s2,
    'live_migrate' => :s2, 'attach'           => :s2, 'detach'          => :s2,
    'evacuate'     => :s2, 'service_dialog'   => :s2, 'transform'       => :s2,
    'transform_mass'           => :s2,
    'associate_floating_ip'    => :s2,
    'disassociate_floating_ip' => :s2,
    'add_security_group'       => :s2,
    'remove_security_group'    => :s2,
    'rename'                   => :s2,

    # specials
    'perf'         => :show,
    'download_pdf' => :show,
    'perf_reload'  => :perf_chart_chooser,
    'perf_refresh' => :perf_refresh_data,
  }.freeze

  def x_button
    model, action = pressed2model_action(params[:pressed])

    allowed_models = %w[common image instance vm miq_template provider automation storage configscript infra_networking automation_manager_provider configuration_manager_provider]
    raise ActionController::RoutingError.new('invalid button action') unless
      allowed_models.include?(model)

    unless X_BUTTON_ALLOWED_ACTIONS.key?(action)
      raise ActionController::RoutingError, _('invalid button action')
    end

    @explorer = true

    method = "#{model}_#{action}"

    # Process model actions that are currently implemented
    if X_BUTTON_ALLOWED_ACTIONS[action] == :s1
      send(method)
    elsif X_BUTTON_ALLOWED_ACTIONS[action] == :s2
      # don't need to set params[:id] and do find_checked_items for methods
      # like ownership, the code in those methods handle it
      if %w[edit right_size resize attach detach live_migrate evacuate
            associate_floating_ip disassociate_floating_ip].include?(action)
        @_params[:id] = (params[:id] ? [params[:id]] : find_checked_items)[0]
      end
      if %w[protect tag].include?(action)
        case model
        when 'storage'
          send(method, Storage)
        when 'infra_networking'
          send(method, Switch)
        when 'automation_manager_provider', 'configuration_manager_provider'
          send(method)
        else
          send(method, VmOrTemplate)
        end
      else
        send(method)
      end
      # if error rendered, do not render any further, do not record history
      # non-error rendering is done below through @refresh_partial
      return if performed?
      @sb[:model]  = model
      @sb[:action] = action
    elsif action == 'perf'
      @sb[:model]  = model
      @sb[:action] = action
      show
    elsif action == 'download_pdf'
      show
    elsif action == 'perf_reload'
      perf_chart_chooser
      return
    elsif action == 'perf_refresh'
      perf_refresh_data
    end

    return if performed?
    # no need to render anything, method will render flash message when async task is completed

    if @refresh_partial == "layouts/flash_msg"
      javascript_flash
    elsif @refresh_partial
      # no need to render anything when download_pdf button is pressed on summary screen
      replace_right_cell unless action == 'download_pdf'
    else
      add_flash(_("Button not yet implemented %{model}:%{action}") % {:model => model, :action => action}, :error) unless @flash_array
      javascript_flash
    end
  end

  # Handle name searches typed into list view explorer screens
  def x_search_by_name
    @explorer = true
    params[:id] = x_node # Get the current tree node id
    tree_select
  end

  # Tree node selected in explorer
  def tree_select(node_info = false)
    @sb[:action] = nil if @sb
    @explorer = true
    @lastaction = "explorer"
    self.x_active_tree = params[:tree] if params[:tree]
    self.x_node = params[:id]
    if node_info
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node)
    else
      replace_right_cell
    end
  end

  # Accordion selected in explorer
  def accordion_select(node_info = false)
    @lastaction = "explorer"
    self.x_active_accord = params[:id].sub(/_accord$/, '')
    self.x_active_tree   = "#{x_active_accord}_tree"
    if node_info
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node)
    else
      replace_right_cell
    end
  end

  private ############################

  def generic_x_button(whitelist)
    @sb[:action] = action = params[:pressed]

    unless whitelist.key?(action)
      raise ActionController::RoutingError, _('invalid button action')
    end

    send_action = whitelist[action]
    send(send_action)
    send_action
  end

  def generic_x_show(x_node_build_options = {})
    @explorer = true
    respond_to do |format|
      format.js do # AJAX, select the node
        unless @record
          redirect_to(:action => "explorer")
          return
        end
        params[:id] = x_build_node_id(@record)
        tree_select
      end
      format.html do # HTML, redirect to explorer
        tree_node_id = TreeBuilder.build_node_id(@record)
        session[:exp_parms] = {:id => tree_node_id}
        redirect_to :action => "explorer"
      end
      format.any { head :not_found } # Anything else, just send 404
    end
  end

  # Set form vars for tag editor
  def x_tags_set_form_vars
    @edit = {}
    @edit[:new] = {}
    @edit[:key] = "#{session[:tag_db]}_edit_tags__#{@object_ids[0]}"
    @edit[:object_ids] = @object_ids
    @edit[:tagging] = @tagging
    tag_edit_build_screen
    build_targets_hash(@tagitems)

    @edit[:current] = copy_hash(@edit[:new])
  end

  def x_edit_tags_cancel
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}", "replace_cell__explorer")
    add_flash(_("Tag Edit was cancelled by the user"))
    get_node_info(x_node)
    @sb[:action] = @edit = nil # clean out the saved info
    replace_right_cell
  end

  def x_edit_tags_save
    tagging_edit_tags_save_and_replace_right_cell
  end

  def x_build_node_id(object)
    TreeNode.new(object).key
  end

  # FIXME: move partly to Tree once Trees are made from TreeBuilder
  def valid_active_node(treenodeid)
    modelname, rec_id, nodetype = TreeBuilder.extract_node_model_and_id(treenodeid)
    return treenodeid if ["root", ""].include?(nodetype) # incase node is root or doesn't have a prefix
    raise _("No Class found for explorer tree node id '%{number}'") % {:number => treenodeid} if modelname.nil?
    kls = modelname.constantize
    return treenodeid if kls == Hash

    unless kls.where(:id => rec_id).exists?
      @replace_trees = [@sb[:active_accord]] # refresh trees
      self.x_node = "root"
      unless @report_deleted
        add_flash(_("Last selected %{record_name} no longer exists") %
                    {:record_name => ui_lookup(:model => kls.to_s)}, :error)
      end
    end
    x_node
  end
end
