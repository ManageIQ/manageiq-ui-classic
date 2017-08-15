class OrchestrationStackController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  def self.table_name
    @table_name ||= "orchestration_stack"
  end

  def index
    redirect_to :action => 'show_list'
  end

  def self.display_methods
    %w(instances children security_groups stack_orchestration_template)
  end

  def display_stack_orchestration_template
    drop_breadcrumb(:name => "%{name} (Orchestration Template)" % {:name => @record.name},
                    :url  => show_link(@record, :display => @display))
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
    @edit = session[:edit]                          # Restore @edit for adv search box

    params[:display] = @display if ["instances"].include?(@display)  # Were we displaying vms/hosts/storages
    params[:page] = @current_page if @current_page.nil?   # Save current page for list refresh

    if params[:pressed] == "custom_button"
      custom_buttons
      return
    end

    if params[:pressed].starts_with?("instance_")        # Handle buttons from sub-items screen
      pfx = pfx_for_vm_button_pressed(params[:pressed])
      process_vm_buttons(pfx)

      # Control transferred to another screen, so return
      return if ["#{pfx}_policy_sim", "#{pfx}_compare", "#{pfx}_tag",
                 "#{pfx}_retire", "#{pfx}_protect", "#{pfx}_ownership",
                 "#{pfx}_refresh", "#{pfx}_right_size",
                 "#{pfx}_reconfigure"].include?(params[:pressed]) &&
                @flash_array.nil?

      unless ["#{pfx}_edit", "#{pfx}_miq_request_new", "#{pfx}_clone",
              "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed])
        @refresh_div = "main_div"
        @refresh_partial = "layouts/gtl"
        show                                                        # Handle VMs buttons
      end
    elsif params[:pressed] == "make_ot_orderable"
      make_ot_orderable
      return
    elsif params[:pressed] == "orchestration_template_copy"
      orchestration_template_copy
      return
    elsif params[:pressed] == "orchestration_templates_view"
      orchestration_templates_view
      return
    else
      params[:page] = @current_page if @current_page.nil?                     # Save current page for list refresh
      @refresh_div = "main_div" # Default div for button.rjs to refresh
      case params[:pressed]
      when "orchestration_stack_delete"
        orchestration_stack_delete
      when "orchestration_stack_retire"
        orchestration_stack_retire
      when "orchestration_stack_retire_now"
        orchestration_stack_retire_now
      when "orchestration_stack_tag"
        tag(OrchestrationStack)
      when params[:pressed] == "custom_button"
        custom_buttons
        return
      end
      return if %w(orchestration_stack_retire orchestration_stack_tag).include?(params[:pressed]) &&
                @flash_array.nil? # Tag screen showing, so return
    end

    if @flash_array.nil? && !@refresh_partial # if no button handler ran, show not implemented msg
      add_flash(_("Button not yet implemented"), :error)
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    elsif @flash_array && @lastaction == "show"
      @orchestration_stack = @record = identify_record(params[:id])
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    end

    if single_delete_test
      single_delete_redirect
    elsif params[:pressed].ends_with?("_edit") || ["#{pfx}_miq_request_new", "#{pfx}_clone",
                                                   "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed])
      render_or_redirect_partial(pfx)
    else
      if @refresh_div == "main_div" && @lastaction == "show_list"
        replace_gtl_main_div
      else
        render_flash
      end
    end
  end

  def stacks_ot_info
    ot = find_record_with_rbac(OrchestrationStack, params[:id]).orchestration_template
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

  def make_ot_orderable
    stack = find_record_with_rbac(OrchestrationStack, params[:id])
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
          page << javascript_reload_toolbars
        end
      end
    end
  end

  def orchestration_template_copy
    @record = find_record_with_rbac(OrchestrationStack, params[:id])
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
    @record = find_record_with_rbac(OrchestrationStack, params[:id])
    add_flash(_("Copy of Orchestration Template was cancelled by the user"))
    render :update do |page|
      page << javascript_prologue
      page.replace(:form_div, :partial => "stack_orchestration_template")
    end
  end

  def stacks_ot_copy_submit
    assert_privileges('orchestration_template_copy')
    original_template = find_record_with_rbac(OrchestrationTemplate, params[:templateId])
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

  def orchestration_templates_view
    template = find_record_with_rbac(OrchestrationStack, params[:id]).orchestration_template
    javascript_redirect :controller => 'catalog', :action => 'ot_show', :id => template.id
  end

  def title
    _("Stack")
  end

  menu_section :clo

  has_custom_buttons
end
