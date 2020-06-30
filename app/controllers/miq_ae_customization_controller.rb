class MiqAeCustomizationController < ApplicationController
  require "English"
  include_concern 'CustomButtons'
  include_concern 'OldDialogs'
  include_concern 'Dialogs'

  helper ApplicationHelper::ImportExportHelper
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  AE_CUSTOM_X_BUTTON_ALLOWED_ACTIONS = {
    'dialog_edit_editor' => :dialog_edit_editor,
    'dialog_copy_editor' => :dialog_copy_editor,
    'dialog_delete'      => :dialog_delete,
    'dialog_new_editor'  => :dialog_new_editor,
    'old_dialogs_new'    => :old_dialogs_new,
    'old_dialogs_edit'   => :old_dialogs_edit,
    'old_dialogs_copy'   => :old_dialogs_copy,
    'old_dialogs_delete' => :old_dialogs_delete,
    'ab_button_new'      => :ab_button_new,
    'ab_button_edit'     => :ab_button_edit,
    'ab_button_delete'   => :ab_button_delete,
    'ab_button_simulate' => :ab_button_simulate,
    'ab_group_reorder'   => :ab_group_reorder,
    'ab_group_edit'      => :ab_group_edit,
    'ab_group_delete'    => :ab_group_delete,
    'ab_group_new'       => :ab_group_new,
  }.freeze

  def x_button
    generic_x_button(AE_CUSTOM_X_BUTTON_ALLOWED_ACTIONS)
  end

  def upload_import_file
    assert_privileges('miq_ae_customization_explorer') # feature like miq_ae_customization_service_dialog_import_export is missing
    if params[:upload].nil? || params[:upload][:file].blank?
      add_flash(_("Use the Choose file button to locate an import file"), :warning)
    else
      begin
        import_file = dialog_import_service.store_for_import(params[:upload][:file].read)
        @import_file_upload_id = import_file.id
        @import = import_file.service_dialog_list
        add_flash(_("Select Dialogs to import"), :info)
      rescue DialogImportValidator::ImportNonYamlError
        add_flash(_("Error: the file uploaded is not of the supported format"), :error)
      rescue DialogImportValidator::BlankFileError
        add_flash(_("Error: the uploaded file is blank"), :error)
      rescue DialogImportValidator::ParsedNonDialogYamlError
        add_flash(_("Error during upload: incorrect Dialog format, only service dialogs can be imported"), :error)
      rescue DialogFieldAssociationValidator::DialogFieldAssociationCircularReferenceError
        add_flash(_("Error during upload: the following dialog fields to be imported contain circular association references: %{error}") % {:error => $ERROR_INFO}, :error)
      rescue DialogImportValidator::InvalidDialogFieldTypeError
        add_flash(_("Error during upload: one of the DialogField types is not supported"), :error)
      rescue DialogImportValidator::InvalidDialogVersionError
        add_flash(_("Error during upload: the version of exported dialog is not supported in this release"), :error)
      end
    end
    get_node_info
    replace_right_cell(:nodetype => x_node)
  end

  def import_service_dialogs
    assert_privileges('miq_ae_customization_explorer') # feature like miq_ae_customization_service_dialog_import_export is missing
    if params[:commit] == _('Commit')
      if params[:dialogs_to_import].blank?
        javascript_flash(:spinner_off => true,
                         :text        => _("At least one Service Dialog must be selected."),
                         :severity    => :error)
        return
      end

      import_file_upload = ImportFileUpload.find_by(:id => params[:import_file_upload_id])

      if import_file_upload
        dialog_import_service.import_service_dialogs(import_file_upload, params[:dialogs_to_import])
        add_flash(_("Service dialogs imported successfully"), :success)
      else
        add_flash(_("Error: ImportFileUpload expired"), :error)
      end
    else
      dialog_import_service.cancel_import(params[:import_file_upload_id])
      add_flash(_("Service dialog import cancelled"), :success)
    end
    get_node_info
    replace_right_cell(:nodetype => x_node, :replace_trees => [:dialogs])
  end

  def export_service_dialogs
    assert_privileges('miq_ae_customization_explorer') # feature like miq_ae_customization_service_dialog_import_export is missing
    if params[:service_dialogs].present?
      dialogs = Dialog.where(:id => params[:service_dialogs])
      dialog_yaml = DialogYamlSerializer.new.serialize(dialogs)
      timestamp = format_timezone(Time.current, Time.zone, "export_filename")
      send_data(dialog_yaml, :filename => "dialog_export_#{timestamp}.yml")
    else
      add_flash(_("At least 1 item must be selected for export"), :error)
      @sb[:flash_msg] = @flash_array
      redirect_to(:action => :explorer)
    end
  end

  def accordion_select
    self.x_active_accord = params[:id].sub(/_accord$/, '')
    self.x_active_tree   = "#{x_active_accord}_tree"

    assert_accordion_and_tree_privileges(x_active_tree)

    get_node_info
    replace_right_cell(:nodetype => x_node)
  end

  def self.session_key_prefix
    "miq_ae_customization"
  end

  def title
    _("Automate Customization")
  end

  def explorer
    @trees = []
    @flash_array = @sb[:flash_msg] if @sb[:flash_msg].present?
    @explorer = true

    build_resolve_screen
    build_accordions_and_trees

    @lastaction = "automate_button"
    @layout = "miq_ae_customization"
    @sb[:action] = nil

    render :layout => "application" unless request.xml_http_request?
  end

  def editor
    if params[:id].present?
      feature = 'dialog_edit_editor'
      @record = Dialog.find(params[:id])
    elsif params[:copy].present?
      feature = 'dialog_copy_editor'
      @record = Dialog.find(params[:copy])
    else
      feature = 'dialog_new_editor'
      @record = Dialog.new
    end
    assert_privileges(feature)
    @title = @record.id ? _("Editing %{name} Service Dialog") % {:name => @record.name} : _("Add a new Dialog")
  end

  def tree_select
    self.x_node = params[:id]
    assert_accordion_and_tree_privileges(x_active_tree)
    get_node_info
    if @replace_tree
      # record being viewed and saved in @sb[:active_node] has been deleted outside UI from VMDB, need to refresh tree
      replace_right_cell(:nodetype => x_node, :replace_trees => [:dialogs])
    else
      replace_right_cell(:nodetype => x_node)
    end
  end

  # Record clicked on in the explorer right cell
  def x_show
    @explorer = true
    @sb[:action] = nil
    if x_active_tree == :old_dialogs_tree
      klass = MiqDialog
      feature = "old_dialogs_accord"
    else
      klass = Dialog
      feature = "dialogs_accord"
    end
    assert_privileges(feature)

    @record = identify_record(params[:id], klass)
    params[:id] = x_build_node_id(@record) # Get the tree node id
    tree_select
  end

  # Dialog show selected from catalog explorer
  def show
    assert_privileges('dialog_accord')  # feature like miq_ae_customization_service_dialog_show is missing
    nodes = params[:id].split("-")
    record = Dialog.find_by(:id =>nodes.last)
    self.x_active_accord = "dialogs"
    self.x_active_tree   = "#{x_active_accord}_tree"
    self.x_node = TreeBuilder.build_node_id(record)
    get_node_info
    redirect_to(:controller => "miq_ae_customization",
                :action     => "explorer",
                :id         => x_node)
  end

  private

  def features
    [
      {
        :role     => "old_dialogs_accord",
        :role_any => true,
        :name     => :old_dialogs,
        :title    => _("Provisioning Dialogs")
      },
      {
        :role     => "dialog_accord",
        :role_any => true,
        :name     => :dialogs,
        :title    => _("Service Dialogs")
      },
      {
        :role     => "ab_buttons_accord",
        :role_any => true,
        :name     => :ab,
        :title    => _("Buttons")
      },
      {
        :role  => "miq_ae_class_import_export",
        :name  => :dialog_import_export,
        :title => _("Import/Export")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def set_active_elements(feature, _x_node_to_set = nil)
    if feature
      self.x_active_tree ||= feature.tree_name
      self.x_active_accord ||= feature.accord_name
    end
    get_node_info
  end

  def dialog_import_service
    @dialog_import_service ||= DialogImportService.new
  end

  def replace_right_cell(options = {})
    nodetype, replace_trees = options.values_at(:nodetype, :replace_trees)
    # fixme, don't call all the time
    trees = build_replaced_trees(replace_trees, %i[ab old_dialogs dialogs])

    @explorer = true
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    reload_trees_by_presenter(presenter, trees)
    presenter[:osf_node] = x_node unless @in_a_form

    rebuild_toolbars(presenter)

    setup_presenter_based_on_active_tree(nodetype, presenter)
    set_right_cell_text(presenter)
    handle_bottom_cell(presenter)
    setup_dialog_sample_buttons(nodetype, presenter)
    set_miq_record_id(presenter)

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  def first_sub_node_is_a_folder?(node)
    sub_node = node.split("-").first

    sub_node == "xx" || !(sub_node == "" && node.split('_').length <= 2)
  end

  def get_node_info
    @show_list = true
    node = x_node
    node = valid_active_node(x_node) unless first_sub_node_is_a_folder?(node)

    node_info = get_specific_node_info(node)

    node_info
  end

  def get_specific_node_info(node)
    if x_active_tree == :ab_tree
      ab_get_node_info(node)
    elsif x_active_tree == :dialogs_tree
      dialog_get_node_info(node)
    elsif x_active_tree == :dialog_import_export_tree
      name_sorted_dialogs = Dialog.all.sort_by { |dialog| dialog.name.downcase }
      @dialog_exports = name_sorted_dialogs.collect { |dialog| [dialog.name, dialog.id] }
      @right_cell_text = _("Service Dialog Import / Export")
    else
      old_dialogs_get_node_info(node)
    end
  end

  def handle_bottom_cell(presenter)
    if @pages || @in_a_form
      if @pages
        presenter.hide(:form_buttons_div)
      elsif @in_a_form && @sb[:action]
        action_url = case x_active_tree
                     when :old_dialogs_tree then 'old_dialogs_update'
                     else
                       case @sb[:action]
                       when 'ab_group_new'     then 'group_create'
                       when 'ab_group_edit'    then 'group_update'
                       when 'ab_group_reorder' then 'ab_group_reorder'
                       when 'ab_button_new'    then 'button_create'
                       when 'ab_button_edit'   then 'button_update'
                       end
                     end
        locals = {
          :action_url   => action_url,
          :record_id    => @record.try(:id),
          :serialize    => @sb[:action].starts_with?('old_dialogs_'),
          :multi_record => @sb[:action] == 'ab_group_reorder',
        }
        presenter.update(:form_buttons_div, render_proc[:partial => "layouts/x_edit_buttons", :locals => locals])
        presenter.remove_paging.show(:form_buttons_div)
      end
      presenter.show(:paging_div)
    else
      presenter.hide(:paging_div).hide(:form_buttons_div)
    end
  end

  def no_items_selected?(field_name)
    !params[field_name] || params[field_name].length.zero? || params[field_name][0] == ""
  end

  def rebuild_toolbars(presenter)
    unless @in_a_form
      c_tb = build_toolbar(center_toolbar_filename) if center_toolbar_filename
    end

    presenter.set_visibility(c_tb.present?, :toolbar)
    presenter.reload_toolbars(:center => c_tb)
  end

  def render_proc
    proc { |opts| render_to_string(opts) }
  end

  def set_miq_record_id(presenter)
    presenter[:record_id] = determine_record_id_for_presenter
  end

  def set_right_cell_text(presenter)
    presenter[:right_cell_text] = @right_cell_text
  end

  def get_session_data
    super
    @resolve = session[:resolve] if session[:resolve]
  end

  def set_session_data
    super
    session[:resolve] = @resolve if @resolve
  end

  def setup_dialog_sample_buttons(nodetype, presenter)
    # TODO: move button from sample dialog to bottom cell

    if x_active_tree == :dialogs_tree && @sb[:active_tab] == "sample_tab" && nodetype != "root" && @record.buttons
      presenter.update(:form_buttons_div, render_proc[:partial => "dialog_sample_buttons"])
      presenter.remove_paging.hide(:form_buttons_div).show(:paging_div)
    end
  end

  def setup_presenter_based_on_active_tree(nodetype, presenter)
    if x_active_tree == :ab_tree
      setup_presenter_for_ab_tree(nodetype, presenter)
    elsif x_active_tree == :dialogs_tree
      setup_presenter_for_dialogs_tree(nodetype, presenter)
    elsif x_active_tree == :old_dialogs_tree
      setup_presenter_for_old_dialogs_tree(nodetype, presenter)
    elsif x_active_tree == :dialog_import_export_tree
      presenter.update(:main_div, render_proc[:partial => "dialog_import_export"])
    end
  end

  def right_cell_text_for_node(record, model_name)
    if record.try(:id)
      _("Editing %{model} \"%{name}\"") % {:name  => record.kind_of?(CustomButtonSet) ? record.name.split("|").first : record.name,
                                           :model => ui_lookup(:model => model_name)}
    else
      _("Adding a new %{model}") % {:model => ui_lookup(:model => model_name)}
    end
  end

  def setup_presenter_for_ab_tree(nodetype, presenter)
    case nodetype
    when 'button_edit'
      @right_cell_text = right_cell_text_for_node(@custom_button, "CustomButton")
      presenter.update(:main_div, render_proc[:partial => "shared/buttons/ab_form"])
    when 'group_edit'
      @right_cell_text = right_cell_text_for_node(@custom_button_set, "CustomButtonSet")
    when 'group_reorder'
      @right_cell_text = _("Buttons Group Reorder")
    end

    # Replace right side with based on selected tree node type
    presenter.update(:main_div, render_proc[:partial => "shared/buttons/ab_list"])
    presenter[:lock_sidebar] = @edit
  end

  def setup_presenter_for_dialogs_tree(nodetype, presenter)
    if nodetype == "root"
      presenter.update(:main_div, render_proc[:partial => "layouts/x_gtl"])
    else
      @sb[:active_tab] = params[:tab_id] || "sample_tab"
      presenter.update(:main_div, render_proc[:partial => "dialog_details"])
    end

    presenter[:build_calendar] = true
    # resetting ManageIQ.oneTransition.oneTrans when tab loads
    presenter.reset_one_trans
  end

  def setup_presenter_for_old_dialogs_tree(nodetype, presenter)
    nodes = nodetype.split("_")
    if nodetype == "root" || nodes[0].split('-').first != "odg"
      partial = nodetype == 'root' ? 'old_dialogs_list' : 'layouts/x_gtl'
      presenter.update(:main_div, render_proc[:partial => partial])
    else
      presenter.update(:main_div, render_proc[:partial => 'old_dialogs_details'])
      @right_cell_text = if @dialog.id.blank? && !@dialog.dialog_type
                           _("Adding a new Dialog")
                         elsif @edit && params[:typ] == "copy"
                           _("Copying Dialog \"%{name}\"") % {:name => @dialog.description}
                         else
                           _("Editing Dialog \"%{name}\"") % {:name => @dialog.description}
                         end

      presenter.reset_one_trans
    end
  end

  def group_button_add_save(typ)
    # override for AE Customization Buttons - the label doesn't say Description
    if @edit[:new][:description].blank?
      render_flash(_("Button Group Hover Text is required"), :error)
      return
    end

    super(typ)
  end

  menu_section :automate

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Automation")},
        {:title => _("Automate")},
        {:title => _("Customization")},
      ],
      :disable_tree => action_name == 'editor',
      :to_explorer  => 'explorer',
    }
  end
end
