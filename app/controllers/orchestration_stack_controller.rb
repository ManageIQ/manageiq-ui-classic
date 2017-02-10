class OrchestrationStackController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin

  def self.table_name
    @table_name ||= "orchestration_stack"
  end

  def index
    redirect_to :action => 'show_list'
  end

  def show
    return if perfmenu_click?
    @display = params[:display] || "main" unless pagination_or_gtl_request?

    @lastaction = "show"
    @orchestration_stack = @record = identify_record(params[:id])
    return if record_no_longer_exists?(@orchestration_stack)

    @gtl_url = "/show"
    drop_breadcrumb({:name => _("Orchestration Stacks"),
                     :url  => "/orchestration_stack/show_list?page=#{@current_page}&refresh=y"}, true)
    case @display
    when "main", "summary_only"
      get_tagdata(@orchestration_stack)
      drop_breadcrumb(:name => _("%{name} (Summary)") % {:name => @orchestration_stack.name},
                      :url  => "/orchestration_stack/show/#{@orchestration_stack.id}")
      @showtype = "main"
      set_summary_pdf_data if @display == 'summary_only'
    when "instances"
      title = ui_lookup(:tables => "vm_cloud")
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @orchestration_stack.name, :title => title},
                      :url  => "/orchestration_stack/show/#{@orchestration_stack.id}?display=#{@display}")
      @view, @pages = get_view(ManageIQ::Providers::CloudManager::Vm, :parent => @orchestration_stack)
      @showtype = @display
    when "children"
      title = ui_lookup(:tables => "orchestration_stack")
      kls   = OrchestrationStack
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @orchestration_stack.name, :title => title},
                      :url  => "/orchestration_stack/show/#{@orchestration_stack.id}?display=#{@display}")
      @view, @pages = get_view(kls, :parent => @orchestration_stack)
      @showtype = @display
    when "security_groups"
      title = ui_lookup(:tables => "security_group")
      kls   = SecurityGroup
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @orchestration_stack.name, :title => title},
                      :url  => "/orchestration_stack/show/#{@orchestration_stack.id}?display=#{@display}")
      @view, @pages = get_view(kls, :parent => @orchestration_stack)  # Get the records (into a view) and the paginator
      @showtype = @display
    when "stack_orchestration_template"
      drop_breadcrumb(:name => "%{name} (Orchestration Template)" % {:name => @orchestration_stack.name},
                      :url  => "/orchestration_stack/show/#{@orchestration_stack.id}?display=#{@display}")
    end

    replace_gtl_main_div if pagination_request?
  end

  def show_list
    process_show_list(
      :where_clause => "orchestration_stacks.type != 'ManageIQ::Providers::AnsibleTower::AutomationManager::Job'"
    )
  end

  def cloud_networks
    show_association('cloud_networks', _('Cloud Networks'), 'cloud_network', :cloud_networks, CloudNetwork)
  end

  def outputs
    show_association('outputs', _('Outputs'), 'output', :outputs, OrchestrationStackOutput)
  end

  def parameters
    show_association('parameters', _('Parameters'), 'parameter', :parameters, OrchestrationStackParameter)
  end

  def resources
    show_association('resources', _('Resources'), 'resource', :resources, OrchestrationStackResource)
  end

  # handle buttons pressed on the button bar
  def button
    restore_edit_for_search
    copy_sub_item_display_value_to_params
    save_current_page_for_refresh
    set_default_refresh_div

    handle_tag_presses(params[:pressed])
    handle_button_pressed(params[:pressed])

    handle_sub_item_presses(params[:pressed]) do |pfx|
      process_vm_buttons(pfx)

      return if button_control_transferred?

      unless button_has_redirect_suffix?(params[:pressed])
        set_refresh_and_show
      end
    end

    return if performed?

    check_if_button_is_implemented

    if button_has_redirect_suffix?(params[:pressed])
      render_or_redirect_partial(pfx)
    else
      button_render_fallback
    end
  end

  def stacks_ot_info
    ot = find_by_id_filtered(OrchestrationStack, params[:id]).orchestration_template
    render :json => {
      :template_id          => ot.id,
      :template_name        => ot.name,
      :template_description => ot.description,
      :template_draft       => ot.draft,
      :template_content     => ot.content
    }
  end

  def stacks_ot_copy
    case params[:button]
    when "cancel"
      stacks_ot_copy_cancel
    when "add"
      stacks_ot_copy_submit
    end
  end

  private

  def textual_group_list
    [%i(properties lifecycle relationships), %i(tags)]
  end
  helper_method :textual_group_list

  def handle_make_ot_orderable
    stack = find_by_id_filtered(OrchestrationStack, params[:id])
    template = stack.orchestration_template
    if template.orderable?
      add_flash(_("Orchestration template \"%{name}\" is already orderable") % {:name => template.name}, :error)
      render_flash
    else
      begin
        template.save_as_orderable!
      rescue => bang
        add_flash(_("An error occured when changing orchestration template \"%{name}\" to orderable: %{err_msg}") %
          {:name => template.name, :err_msg => bang.message}, :error)
        render_flash
      else
        @record = stack
        add_flash(_("Orchestration template \"%{name}\" is now orderable") % {:name => template.name})
        render :update do |page|
          page << javascript_prologue
          page.replace(:form_div, :partial => "stack_orchestration_template")
          page << javascript_pf_toolbar_reload('center_tb', build_toolbar(center_toolbar_filename))
          page << javascript_show_if_exists(:toolbar)
        end
      end
    end
  end

  def handle_orchestration_template_copy
    @record = find_by_id_filtered(OrchestrationStack, params[:id])
    if @record.orchestration_template.orderable?
      add_flash(_("Orchestration template \"%{name}\" is already orderable") %
        {:name => @record.orchestration_template.name}, :error)
      render_flash
    else
      render :update do |page|
        page << javascript_prologue
        page.replace(:form_div, :partial => "copy_orchestration_template")
        page << javascript_hide_if_exists(:toolbar)
      end
    end
  end

  def stacks_ot_copy_cancel
    @record = find_by_id_filtered(OrchestrationStack, params[:id])
    add_flash(_("Copy of Orchestration Template was cancelled by the user"))
    render :update do |page|
      page << javascript_prologue
      page.replace(:form_div, :partial => "stack_orchestration_template")
      page << javascript_show_if_exists(:toolbar)
    end
  end

  def stacks_ot_copy_submit
    assert_privileges('orchestration_template_copy')
    original_template = find_by_id_filtered(OrchestrationTemplate, params[:templateId])
    if params[:templateContent] == original_template.content
      add_flash(_("Unable to create a new template copy \"%{name}\": old and new template content have to differ.") %
        {:name => params[:templateName]})
      render_flash
    elsif params[:templateContent].nil? || params[:templateContent] == ""
      add_flash(_("Unable to create a new template copy \"%{name}\": new template content cannot be empty.") %
        {:name => params[:templateName]})
      render_flash
    else
      ot = OrchestrationTemplate.new(
        :name        => params[:templateName],
        :description => params[:templateDescription],
        :type        => original_template.type,
        :content     => params[:templateContent],
        :draft       => params[:templateDraft] == "true",
      )
      begin
        ot.save_as_orderable!
      rescue => bang
        add_flash(_("Error during 'Orchestration Template Copy': %{error_message}") %
          {:error_message => bang.message}, :error)
        render_flash
      else
        flash_message = _("%{model} \"%{name}\" was saved") % {:model => ui_lookup(:model => 'OrchestrationTemplate'),
                                                               :name  => ot.name}
        javascript_redirect :controller    => 'catalog',
                            :action        => 'ot_show',
                            :id            => ot.id,
                            :flash_message => flash_message
      end
    end
  end

  def handle_orchestration_templates_view
    template = find_by_id_filtered(OrchestrationStack, params[:id]).orchestration_template
    javascript_redirect :controller => 'catalog', :action => 'ot_show', :id => template.id
  end

  def title
    _("Stack")
  end

  def handled_buttons
    %w(
      make_ot_orderable
      orchestration_template_copy
      orchestration_templates_view
      orchestration_stack_delete
      orchestration_stack_retire
      orchestration_stack_retire_now
    )
  end

  def handle_orchestration_stack_delete
    orchestration_stack_delete
    redirect_to_retire_screen_if_single_delete
  end

  def handle_orchestration_stack_retire
    orchestration_stack_retire
  end

  def handle_orchestration_stack_retire_now
    orchestration_stack_retire_now
  end

  menu_section :clo
end
