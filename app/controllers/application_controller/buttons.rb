module ApplicationController::Buttons
  extend ActiveSupport::Concern

  included do
    include Mixins::PlaybookOptions
    include CustomButtonHelper
  end

  def ab_group_edit
    assert_privileges("ab_group_edit")
    group_new_edit("edit")
  end

  def ab_group_new
    assert_privileges("ab_group_new")
    group_new_edit("new")
  end

  def ab_group_reorder
    assert_privileges("ab_group_reorder")
    case params[:button]
    when "cancel"
      add_flash(_("Button Group Reorder cancelled"))
      @edit = session[:edit] = nil # clean out the saved info
      ab_get_node_info(x_node) if x_active_tree == :ab_tree
      replace_right_cell(:nodetype => x_node)
    when "save"
      return unless load_edit("group_reorder", "replace_cell__explorer")

      # save group_index of each custombuttonset in set_data
      if x_active_tree == :sandt_tree
        button_order = []
        st = ServiceTemplate.find(@sb[:applies_to_id])
      end
      @edit[:new][:fields].each_with_index do |field, i|
        field_nodes = field.last.split('-')
        button_order.push(field.last) if x_active_tree == :sandt_tree
        next if field_nodes.first != "cbg"

        cs = CustomButtonSet.find(field_nodes.last)
        cs.set_data[:group_index] = i + 1
        cs.save!
      end

      if x_active_tree == :sandt_tree
        st.options[:button_order] = button_order
        st.save
      end
      add_flash(_("Button Group Reorder saved"))
      @edit = session[:edit] = nil # clean out the saved info
      ab_get_node_info(x_node) if x_active_tree == :ab_tree
      replace_right_cell(:nodetype => x_node, :replace_trees => x_active_tree == :ab_tree ? [:ab] : [:sandt])
    else
      if params[:button] == "reset"
        @changed = session[:changed] = false
        add_flash(_("All changes have been reset"), :warning)
      end
      group_reorder_set_form_vars
      @in_a_form = true
      @lastaction = "automate_button"
      @layout = "miq_ae_automate_button"
      replace_right_cell(:nodetype => "group_reorder", :action => "group_reorder")
    end
  end

  def group_reorder_field_changed
    assert_privileges("ab_group_reorder")
    if params['selected_fields']
      return unless load_edit("group_reorder", "replace_cell__explorer")

      move_cols_up if params[:button] == "up"
      move_cols_down if params[:button] == "down"
      @changed = (@edit[:new] != @edit[:current])
      @refresh_partial = "group_order_form"
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg") unless @refresh_div && @refresh_div != "column_lists"
        page << "miqScrollTop();" if @flash_array.present?
        page.replace(@refresh_div, :partial => "shared/buttons/#{@refresh_partial}") if @refresh_div
        page << "miqSparkle(false);"
        page << javascript_for_miq_button_visibility_changed(@changed)
      end
    else
      add_flash(_("No Button Group was selected!"), :error)
      javascript_flash
    end
  end

  def group_create
    assert_privileges("ab_group_new")
    group_create_update("create")
  end

  def group_update
    assert_privileges("ab_group_edit")
    group_create_update("update")
  end

  def ab_button_new
    assert_privileges("ab_button_new")
    button_new_edit("new")
  end

  def ab_button_edit
    assert_privileges("ab_button_edit")
    button_new_edit("edit")
  end

  def ab_button_form_data
    assert_privileges("ab_button_new", "ab_button_edit")
    instances = MiqAeClass.find_distinct_instances_across_domains(current_user, "SYSTEM/PROCESS").collect(&:name).sort
    templates = ServiceTemplateAnsiblePlaybook.order(:name).pluck(:name)
    render :json => {:distinct_instances => instances, :ansible_playbooks => templates}
  end

  def group_form_valid
    required = %i[name description button_icon]

    required.none? do |field|
      @edit[:new][field].blank?
    end
  end

  def open_url_after_dialog
    external_url = ExternalUrl.find_by(
      :resource_id   => params[:targetId],
      :resource_type => params[:realTargetType],
      :user          => User.current_user
    )
    # FIXME: remove this fallback once the ':remote_console_url=' is removed from automate
    external_url ||= SystemConsole.find_by(:vm_id => params[:targetId])

    url = external_url.try(:url)

    render :json => {:open_url => url}
  end

  private

  BASE_MODEL_EXPLORER_CLASSES = [MiqGroup, MiqTemplate, Tenant, User, Vm].freeze

  def custom_button_done
    external_url = ExternalUrl.find_by(
      :resource_id   => params[:id],
      :resource_type => params[:base_cls],
      :user          => User.current_user
    )
    # FIXME: remove this fallback once the ':remote_console_url=' is removed from automate
    external_url ||= SystemConsole.find_by(:vm_id => params[:id])

    url = external_url.try(:url)
    if url.present?
      javascript_open_window(url)
    else
      render_flash(_('No url was returned from automate.'), :error)
    end
  end

  def custom_buttons_invoke(button, objs)
    if objs.length > 1 &&
       (button.options&.key?(:submit_how) && button.options[:submit_how].to_s == 'all')
      button.invoke(objs, 'UI')
    else
      objs.each { |obj| button.invoke(obj, 'UI') }
    end
  end

  def sync_playbook_dialog(button)
    service_template = ServiceTemplate.find_by(:name => button.uri_attributes[:service_template_name])
    dialog_id = nil
    service_template&.resource_actions&.each do |ra|
      d = Dialog.where(:id => ra.dialog_id).first
      dialog_id = d.id if d
    end
    if dialog_id && button.resource_action.dialog_id != dialog_id
      button.resource_action.dialog_id = dialog_id
      button.save
    end
  end

  def custom_buttons(ids = nil, display_options = {})
    button = CustomButton.find(params[:button_id])
    cls = custom_button_class_model(button.applies_to_class)
    @explorer = true if BASE_MODEL_EXPLORER_CLASSES.include?(cls)
    ids ||= params[:id] unless relationship_table_screen? && @record.nil?
    ids = find_checked_items if ids == 'LIST' || ids.nil?

    if ids.blank?
      render_flash(_("Error launching custom button: No item was selected."), :error)
      return
    end

    objs = Rbac.filtered(cls.where(:id => ids))
    obj = objs.first

    if objs.empty?
      render_flash(_("Error launching custom button: No item was selected."), :error)
      return
    end

    @right_cell_text = _("%{record} - \"%{button_text}\"") % {:record => obj.name, :button_text => button.name}

    if button.resource_action.dialog_id
      sync_playbook_dialog(button) if button.options.try(:[], :button_type) == 'ansible_playbook'
      options = {
        :header     => @right_cell_text,
        :target_id  => obj.id,
        :target_ids => objs.collect(&:id),
        :target_kls => obj.class.name,
      }

      options[:dialog_locals] = DialogLocalService.new.determine_dialog_locals_for_custom_button(obj, button.name, button.resource_action, display_options)
      options[:dialog_locals][:open_url] = button.options.present? && button.options.fetch_path(:open_url)
      options.merge!(display_options) unless display_options.empty?
      dialog_initialize(button.resource_action, options)

    elsif button.options.present? && button.options.fetch_path(:open_url)
      # not supported for objs: cannot do wait for task for multiple tasks
      task_id = button.invoke_async(obj, 'UI')
      initiate_wait_for_task(
        :task_id      => task_id,
        :action       => :custom_button_done,
        :extra_params => { :base_cls => cls.base_class.to_s }
      )

    else
      begin
        custom_buttons_invoke(button, objs)
      rescue StandardError => bang
        add_flash(_("Error launching: \"%{task_description}\" %{error_message}") %
          {:task_description => params[:desc], :error_message => bang.message}, :error)
      else
        add_flash(_("\"%{task_description}\" was launched") % {:task_description => params[:desc]})
      end
      javascript_flash
    end
  end

  def load_available_dialogs
    @edit[:new][:available_dialogs] = {}
    Dialog.all.each do |d|
      @edit[:new][:available_dialogs][d.id] = d.label
    end
  end

  def group_button_cancel(typ)
    if typ == "update"
      add_flash(_("Edit of Button Group \"%{name}\" was cancelled by the user") % {:name => @edit[:current][:name]})
    else
      add_flash(_("Add of new Button Group was cancelled by the user"))
    end
    @edit = session[:edit] = nil # clean out the saved info
    ab_get_node_info(x_node) if x_active_tree == :ab_tree
    replace_right_cell(:nodetype => x_node)
  end

  def group_button_add_save(typ)
    assert_privileges(params[:button] == "add" ? "ab_group_new" : "ab_group_edit")
    if typ == "update"
      update_page_content("saved")
    else
      all_sets = CustomButtonSet.find_all_by_class_name(params[:applies_to_class])
      all_sets.each_with_index do |group, i|
        group.set_data[:group_index] = i + 1
        group.save!
      end
      if x_active_tree == :sandt_tree
        aset = CustomButtonSet.find_by(:id => params[:id])
        # push new button at the end of button_order array
        if aset
          st = ServiceTemplate.find(@sb[:applies_to_id])
          st.custom_button_sets.push(aset)
          st.options[:button_order] ||= []
          st.options[:button_order].push("cbg-#{aset.id}")
          st.save
        end
      end
      update_page_content("added")
    end
  end

  def update_page_content(action)
    add_flash("Button Group #{params[:name]} was #{action}")
    @edit = session[:edit] = nil # clean out the saved info
    ab_get_node_info(x_node) if x_active_tree == :ab_tree
    replace_right_cell(:nodetype => x_node, :replace_trees => x_active_tree == :ab_tree ? [:ab] : [:sandt])
  end

  def group_create_update(typ)
    @edit = session[:edit]
    @record = @custom_button_set = @edit[:custom_button_set_id] ? CustomButtonSet.find(@edit[:custom_button_set_id]) : CustomButtonSet.new
    @changed = (@edit[:new] != @edit[:current])
    case params[:button]
    when 'cancel'      then group_button_cancel(typ)
    when 'add', 'save' then group_button_add_save(typ)
    end
  end

  # Set form variables for button add/edit
  def group_reorder_set_form_vars
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "group_reorder"
    @edit[:new][:fields] = []
    @sb[:buttons_node] = true
    if x_active_tree == :ab_tree
      groups = CustomButtonSet.find_all_by_class_name(x_node.split('_').last)
      groups.each do |g|
        @edit[:new][:fields].push([g.name.split('|').first, "#{g.kind_of?(CustomButton) ? 'cb' : 'cbg'}-#{g.id}"])
      end
    else
      st = ServiceTemplate.find(@sb[:applies_to_id])
      groups = st.custom_button_sets + st.custom_buttons
      if st.options && st.options[:button_order]
        st.options[:button_order].each do |item_id|
          groups.each do |g|
            rec_id = "#{g.kind_of?(CustomButton) ? 'cb' : 'cbg'}-#{g.id}"
            @edit[:new][:fields].push([g.name.split('|').first, rec_id]) if item_id == rec_id
          end
        end
      end
    end

    @edit[:current] = copy_hash(@edit[:new])
    @sb[:button_groups] = nil
    @sb[:buttons] = nil
    session[:edit] = @edit
  end

  def group_new_edit(typ)
    @record = @custom_button_set = typ == "new" ? CustomButtonSet.new : CustomButtonSet.find(params[:id])
    if typ == "edit" && x_node.split('_').last == "ub"
      add_flash(_("'Unassigned Button Group' can not be edited"), :error)
      get_node_info
      replace_right_cell(:nodetype => x_node)
      return
    end
    group_set_form_vars
    @right_cell_text = if typ == "new"
                         _("Adding a new Button Group")
                       else
                         _("Editing Button Group \"%{name}\"") % {:name => @custom_button_set.name.split('|').first}
                       end
    @in_a_form = true
    @lastaction = "automate_button"
    @layout = "miq_ae_automate_button"
    @sb[:button_groups] = nil
    @sb[:buttons] = nil

    # Symbol selection based on active controller
    if controller_path == 'miq_ae_customization'
      replace_right_cell(:nodetype => 'group_edit')
    else
      replace_right_cell(:action => 'group_edit')
    end
  end

  def button_new_edit(typ)
    @record = @custom_button = typ == "new" ? CustomButton.new : CustomButton.find(params[:id])
    @in_a_form = true
    @changed = session[:changed] = false
    @breadcrumbs = []
    @right_cell_text = if typ == "new"
                         _("Adding a new Button")
                       else
                         _("Editing Button \"%{name}\"") % {:name => @custom_button.name}
                       end
    @lastaction = "automate_button"
    @layout = "miq_ae_automate_button"
    @sb[:buttons] = nil
    @sb[:button_groups] = nil
    # When "Add Button" is clicked from a button group node, x_node contains
    # "cbg-<id>" — extract it so the form can link the new button to the group.
    cbg_match = typ == "new" && x_node&.match(/cbg-(\d+)/)
    @sb[:button_group_id] = cbg_match ? cbg_match[1].to_i : nil

    # Symbol selection based on active controller
    if controller_path == 'miq_ae_customization'
      replace_right_cell(:nodetype => 'button_edit')
    else
      replace_right_cell(:action => 'button_edit')
    end
  end

  # Set form variables for button add/edit
  def group_set_form_vars
    @sb[:buttons_node] = true
    if session[:resolve]
      @resolve = session[:resolve]
    else
      build_resolve_screen
    end
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "bg_edit__#{@custom_button_set.id || "new"}"
    @edit[:custom_button_set_id] = @custom_button_set.id
    @edit[:rec_id] = @custom_button_set.try(:id)
    @edit[:new][:name] = @custom_button_set[:name].split("|").first if @custom_button_set[:name].present?
    @edit[:new][:applies_to_class] = @custom_button_set[:set_data] && @custom_button_set[:set_data][:applies_to_class] ? @custom_button_set[:set_data][:applies_to_class] : @sb[:applies_to_class]
    @edit[:new][:description] = @custom_button_set.description
    @edit[:new][:button_icon] = @custom_button_set[:set_data] && @custom_button_set[:set_data][:button_icon] ? @custom_button_set[:set_data][:button_icon] : ""
    @edit[:new][:button_color] = @custom_button_set[:set_data] && @custom_button_set[:set_data][:button_color] ? @custom_button_set[:set_data][:button_color] : ""
    @edit[:new][:display] = @custom_button_set[:set_data] && @custom_button_set[:set_data].key?(:display) ? @custom_button_set[:set_data][:display] : true
    @edit[:new][:fields] = []

    button_order = @custom_button_set[:set_data].try(:[], :button_order)
    if button_order # show assigned buttons in order they were saved
      button_order.each do |bidx|
        @custom_button_set.members.each do |mem|
          @edit[:new][:fields].push([mem.name, mem.id]) if bidx == mem.id && !@edit[:new][:fields].include?([mem.name, mem.id])
        end
      end
    else
      @custom_button_set.members.each do |mem|
        @edit[:new][:fields].push([mem.name, mem.id])
      end
    end
    @edit[:new][:available_fields] =
      CustomButton.buttons_for(@sb[:applies_to_class])
                  .select { |u| u.custom_button_sets.blank? }
                  .sort_by(&:name)
                  .collect { |u| [u.name, u.id] }
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  def move_cols_top
    if params[:selected_fields].blank? || params[:selected_fields][0] == ""
      add_flash(_("No fields were selected to move top"), :error)
      return
    end
    consecutive, first_idx, last_idx = selected_consecutive?
    if !consecutive
      add_flash(_("Select only one or consecutive fields to move to the top"), :error)
    else
      if first_idx.positive?
        @edit[:new][:fields][first_idx..last_idx].reverse_each do |field|
          pulled = @edit[:new][:fields].delete(field)
          @edit[:new][:fields].unshift(pulled)
        end
      end
      @refresh_div = "column_lists"
      @refresh_partial = "column_lists"
    end
    @selected = params[:selected_fields]
  end

  def move_cols_bottom
    if params[:selected_fields].blank? || params[:selected_fields][0] == ""
      add_flash(_("No fields were selected to move bottom"), :error)
      return
    end
    consecutive, first_idx, last_idx = selected_consecutive?
    if !consecutive
      add_flash(_("Select only one or consecutive fields to move to the bottom"), :error)
    else
      if last_idx < @edit[:new][:fields].length - 1
        @edit[:new][:fields][first_idx..last_idx].each do |field|
          pulled = @edit[:new][:fields].delete(field)
          @edit[:new][:fields].push(pulled)
        end
      end
      @refresh_div = "column_lists"
      @refresh_partial = "column_lists"
    end
    @selected = params[:selected_fields]
  end

  def buttons_get_node_info(node)
    nodetype = node.split("_")
    # initializing variables to hold data for selected node
    @custom_button = nil
    @sb[:button_groups] = nil
    @sb[:buttons] = nil
    @sb[:buttons_node] = true
    @sb[:applies_to_class] = "ServiceTemplate"
    @sb[:applies_to_id] = nodetype[1].split('-').last

    if nodetype.length == 3 && nodetype[2].split('-').first == "cbg" # buttons group selected
      @sb[:applies_to_class] = "ServiceTemplate"
      @record = CustomButtonSet.find(nodetype[2].split('-').last)
      # saving id of catalogitem to use it in view to build id for right cell
      @sb[:rec_id] = @record.id
      @right_cell_text = _("Button Group \"%{name}\"") % {:name => @record.name.split("|").first}
      @sb[:buttons] = []
      button_order = @record[:set_data] && @record[:set_data][:button_order] ? @record[:set_data][:button_order] : nil
      button_order&.each do |bidx| # show assigned buttons in order they were saved
        @record.members.each do |b|
          next if bidx != b.id

          button = {
            :name         => b.name,
            :id           => b.id,
            :description  => b.description,
            :button_icon  => b.options[:button_icon],
            :button_color => b.options[:button_color],
          }
          @sb[:buttons].push(button) unless @sb[:buttons].include?(button)
        end
      end
    elsif nodetype.length >= 3 && (nodetype[2].split('-').first == "cb" || nodetype[3].split('-').first == "cb") # button selected
      id = nodetype[2].split('-').first == "cb" ? nodetype[2].split('-').last : nodetype[3].split('-').last
      @record = @custom_button = CustomButton.find(id)
      build_resolve_screen
      @resolve[:new][:attrs] = []
      if @custom_button.uri_attributes
        @custom_button.uri_attributes.each do |attr|
          if attr[0] != "object_name" && attr[0] != "request"
            @resolve[:new][:attrs].push(attr) unless @resolve[:new][:attrs].include?(attr)
          end
        end
        @resolve[:new][:object_request] = @custom_button.uri_attributes["request"]
      end
      @sb[:user_roles] = []
      if @custom_button.visibility && @custom_button.visibility[:roles] && @custom_button.visibility[:roles][0] != "_ALL_"
        role_ids = @custom_button.visibility[:roles]
        @sb[:user_roles] = MiqUserRole.where(:id => role_ids).order(:name).pluck(:name)
      end
      @resolve[:new][:target_class] = "ServiceTemplate"
      dialog_id = @custom_button.resource_action.dialog_id
      @sb[:dialog_label] = dialog_id ? Dialog.find(dialog_id).label : _("No Dialog")
      @right_cell_text = _("Button \"%{name}\"") % {:name => @custom_button.name}
    end
    @right_cell_div = "ab_list"
  end

  def build_resolve_screen
    @resolve ||= {}
    @resolve[:new] ||= {}
    @resolve[:new][:starting_object] ||= "SYSTEM/PROCESS"
    @resolve[:new][:readonly] = false unless @resolve[:new][:readonly]
    @resolve[:throw_ready] = false

    # Following commented out since all resolutions start at SYSTEM/PROCESS
    #   @resolve[:starting_objects] = MiqAeClass.find_all_by_namespace("SYSTEM").collect{|c| c.fqname}

    matching_instances = MiqAeClass.find_distinct_instances_across_domains(current_user, @resolve[:new][:starting_object])
    if matching_instances.any?
      @resolve[:instance_names] = matching_instances.collect(&:name)
      instance_name = @custom_button&.uri_object_name
      @resolve[:new][:instance_name] = instance_name || @resolve[:new][:instance_name] || "Request"
      @resolve[:new][:object_message] = @custom_button.try(:uri_message) || @resolve[:new][:object_message] || "create"
      @resolve[:target_class] = nil
      @resolve[:target_classes] = CustomButton.button_classes.each_with_object({}) do |klass, hash|
        hash[klass] = target_class_name(klass)
      end
      @resolve[:new][:attrs] ||= []
      if @resolve[:new][:attrs].empty?
        ApplicationController::AE_MAX_RESOLUTION_FIELDS.times { @resolve[:new][:attrs].push([]) }
      else
        # add empty array if @resolve[:new][:attrs] length is less than ApplicationController::AE_MAX_RESOLUTION_FIELDS
        ApplicationController::AE_MAX_RESOLUTION_FIELDS.times { @resolve[:new][:attrs].push([]) if @resolve[:new][:attrs].length < ApplicationController::AE_MAX_RESOLUTION_FIELDS }
      end
      @resolve[:throw_ready] = ready_to_throw
    else
      add_flash(_("Simulation unavailable: Required Class \"System/Process\" is missing"), :warning)
    end
  end

  def move_cols_up
    if params[:selected_fields].blank? || params[:selected_fields][0] == ""
      add_flash(_("No fields were selected to move up"), :error)
      return
    end
    consecutive, first_idx, last_idx = selected_consecutive?
    if !consecutive
      add_flash(_("Select only one or consecutive fields to move up"), :error)
    else
      if first_idx.positive?
        @edit[:new][:fields][first_idx..last_idx].reverse_each do |field|
          pulled = @edit[:new][:fields].delete(field)
          @edit[:new][:fields].insert(first_idx - 1, pulled)
        end
      end
      @refresh_div = "column_lists"
      @refresh_partial = "column_lists"
    end
    @selected = params[:selected_fields]
  end

  def move_cols_down
    if params[:selected_fields].blank? || params[:selected_fields][0] == ""
      add_flash(_("No fields were selected to move down"), :error)
      return
    end
    consecutive, first_idx, last_idx = selected_consecutive?
    if !consecutive
      add_flash(_("Select only one or consecutive fields to move down"), :error)
    else
      if last_idx < @edit[:new][:fields].length - 1
        insert_idx = last_idx + 1 # Insert before the element after the last one
        insert_idx = -1 if last_idx == @edit[:new][:fields].length - 2 # Insert at end if 1 away from end
        @edit[:new][:fields][first_idx..last_idx].each do |field|
          pulled = @edit[:new][:fields].delete(field)
          @edit[:new][:fields].insert(insert_idx, pulled)
        end
      end
      @refresh_div = "column_lists"
      @refresh_partial = "column_lists"
    end
    @selected = params[:selected_fields]
  end

  def selected_consecutive?
    first_idx = last_idx = 0
    @edit[:new][:fields].each_with_index do |nf, idx|
      first_idx = idx if nf[1].to_s == params[:selected_fields].first
      if nf[1].to_s == params[:selected_fields].last
        last_idx = idx
        break
      end
    end
    is_consecutive = last_idx - first_idx + 1 <= params[:selected_fields].length
    [is_consecutive, first_idx, last_idx]
  end

end
