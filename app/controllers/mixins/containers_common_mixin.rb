module ContainersCommonMixin
  extend ActiveSupport::Concern
  include ServiceDialogCreationMixin

  def button
    @edit = session[:edit]                          # Restore @edit for adv search box
    params[:display] = @display if ["#{params[:controller]}s"].include?(@display)  # displaying container_*
    params[:page] = @current_page if @current_page.nil?   # Save current page for list refresh

    if params[:pressed] == "custom_button"
      custom_buttons
      return
    end

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    model = self.class.model
    tag(model) if params[:pressed] == "#{params[:controller]}_tag"
    if [ContainerReplicator, ContainerGroup, ContainerNode, ContainerImage].include?(model)
      assign_policies(model) if params[:pressed] == "#{model.name.underscore}_protect"
      check_compliance(model) if params[:pressed] == "#{model.name.underscore}_check_compliance"
    end
    if params[:pressed] == 'service_dialog_from_ct'
      create_service_dialog
      return
    end

    return if ["#{params[:controller]}_tag"].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing

    # Handle scan
    if params[:pressed] == "container_image_scan"
      scan_images

      if @lastaction == "show"
        javascript_flash
      else
        replace_main_div :partial => "layouts/gtl"
      end
    end
  end

  def service_dialog_from_ct
    assert_privileges("service_dialog_from_ct")
    ct = ContainerTemplate.find_by(:id => params[:id])
    @right_cell_text = _("Adding a new Service Dialog from Container Template \"%{name}\"") % {:name => ct.name}
    @edit = {:new    => {:dialog_name => ""},
             :key    => "ct_edit__#{ct.id}",
             :rec_id => ct.id}
    @in_a_form = true
    render "service_dialog_from_ct"
  end

  def service_dialog_from_ct_submit
    case params[:button]
    when "cancel"
      service_dialog_from_ct_submit_cancel
    when "save"
      service_dialog_from_ct_submit_save
    end
  end

  def ct_form_field_changed
    dialog_creation_form_field_changed("ct_edit__#{params[:id]}")
  end

  private

  def create_service_dialog
    assert_privileges(params[:pressed])
    drop_breadcrumb(:name => _("Create Service Dialog"), :url => "/container_template/service_dialog_from_ct")
    javascript_redirect :action => 'service_dialog_from_ct',
                        :id     => params[:id],
                        :escape => false
  end

  def service_dialog_from_ct_submit_cancel
    add_flash(_("Creation of a new Service Dialog was cancelled by the user"))
    @in_a_form = false
    @edit = @record = nil
    session[:flash_msgs] = @flash_array.dup # Put msg in session for next transaction to display
    javascript_redirect previous_breadcrumb_url
  end

  def service_dialog_from_ct_submit_save
    assert_privileges("service_dialog_from_ct")
    load_edit("ct_edit__#{params[:id]}")
    begin
      ct_params = ContainerTemplate.find_by(:id => params[:id]).container_template_parameters.to_a
      Dialog::ContainerTemplateServiceDialog.new.create_dialog(@edit[:new][:dialog_name],
                                                               ct_params)
    rescue => bang
      add_flash(_("Error when creating a Service Dialog from Container Template: %{error_message}") %
                  {:error_message => bang.message}, :error)
      javascript_flash
    else
      add_flash(_("Service Dialog \"%{name}\" was successfully created") %
                  {:name => @edit[:new][:dialog_name]}, :success)
      @in_a_form = false
      @edit = @record = nil
      session[:flash_msgs] = @flash_array.dup # Put msg in session for next transaction to display
      javascript_redirect previous_breadcrumb_url
    end
  end

  # Scan all selected or single displayed image(s)
  def scan_images
    assert_privileges("image_scan")
    showlist = @lastaction == "show_list"
    ids = showlist ? find_checked_ids_with_rbac(ContainerImage) : find_current_item(ContainerImage)

    if ids.empty?
      add_flash(_("No %{model} were selected for Analysis") % {:model => ui_lookup(:tables => "container_image")},
                :error)
    else
      process_scan_images(ids)
    end

    showlist ? show_list : show
    ids.count
  end

  def check_compliance(model)
    assert_privileges("#{model.name.underscore}_check_compliance")
    showlist = @lastaction == "show_list"
    ids = showlist ? find_checked_ids_with_rbac(model) : find_current_item(model)

    if ids.empty?
      add_flash(_("No %{model} were selected for %{task}") % {:model => ui_lookup(:models => model.to_s),
                                                              :task  => "Compliance Check"}, :error)
    else
      process_check_compliance(model, ids)
    end

    showlist ? show_list : show
    ids.count
  end

  def find_current_item(model)
    if params[:id].nil? || model.find_by(:id => params[:id].to_i).nil?
      add_flash(_("%{model} no longer exists") % {:model => ui_lookup(:model => model.to_s)}, :error)
      []
    else
      [find_id_with_rbac(model, params[:id].to_i)]
    end
  end

  def process_scan_images(ids)
    ContainerImage.where(:id => ids).order("lower(name)").each do |image|
      image_name = image.name
      begin
        image.scan
      rescue => bang
        add_flash(_("%{model} \"%{name}\": Error during 'Analysis': %{message}") %
                      {:model   => ui_lookup(:model => "ContainerImage"),
                       :name    => image_name,
                       :message => bang.message},
                  :error) # Push msg and error flag
      else
        add_flash(_("\"%{record}\": Analysis successfully initiated") % {:record => image_name})
      end
    end
  end

  def process_check_compliance(model, ids)
    model.where(:id => ids).order("lower(name)").each do |entity|
      begin
        entity.check_compliance
      rescue => bang
        add_flash(_("%{model} \"%{name}\": Error during 'Check Compliance': %{error}") %
                   {:model => ui_lookup(:model => model.to_s),
                    :name  => entity.name,
                    :error => bang.message},
                  :error) # Push msg and error flag
      else
        add_flash(_("\"%{record}\": Compliance check successfully initiated") % {:record => entity.name})
      end
    end
  end

  included do
    menu_section :cnt

    include Mixins::GenericListMixin
    include Mixins::GenericSessionMixin
    include Mixins::GenericShowMixin
    include Mixins::MoreShowActions
  end

  class_methods do
    def display_methods
      %w(
        container_groups containers container_services container_routes container_replicators
        container_projects container_images container_image_registries container_nodes
        persistent_volumes container_builds container_templates
      )
    end
  end
end
