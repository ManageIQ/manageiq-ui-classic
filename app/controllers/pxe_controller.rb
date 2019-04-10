class PxeController < ApplicationController
  # Methods for accordions
  include_concern 'PxeServers'
  include_concern 'PxeImageTypes'
  include_concern 'PxeCustomizationTemplates'
  include_concern 'IsoDatastores'

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  PXE_X_BUTTON_ALLOWED_ACTIONS = {
    'pxe_image_edit'                => :pxe_image_edit,
    'pxe_image_type_new'            => :pxe_image_type_new,
    'pxe_image_type_edit'           => :pxe_image_type_edit,
    'pxe_image_type_delete'         => :pxe_image_type_delete,
    'pxe_server_new'                => :pxe_server_new,
    'pxe_server_edit'               => :pxe_server_edit,
    'pxe_server_delete'             => :pxe_server_delete,
    'pxe_server_refresh'            => :pxe_server_refresh,
    'pxe_wimg_edit'                 => :pxe_wimg_edit,
    'iso_datastore_new'             => :iso_datastore_new,
    'iso_datastore_refresh'         => :iso_datastore_refresh,
    'iso_datastore_delete'          => :iso_datastore_delete,
    'iso_image_edit'                => :iso_image_edit,
    'customization_template_new'    => :customization_template_new,
    'customization_template_delete' => :customization_template_delete,
    'customization_template_copy'   => :customization_template_copy,
    'customization_template_edit'   => :customization_template_edit,
  }.freeze

  def x_button
    generic_x_button(PXE_X_BUTTON_ALLOWED_ACTIONS)
  end

  def accordion_select
    super(true)
  end

  def tree_select
    super(true)
  end

  def explorer
    @breadcrumbs = []
    @explorer = true

    build_accordions_and_trees
    return if request.xml_http_request?

    @right_cell_div ||= "pxe_server_list"
    @right_cell_text ||= _("All PXE Servers")

    render :layout => "application"
  end

  def title
    @title = "PXE"
  end

  def self.table_name
    @table_name = "pxe"
  end

  private

  def features
    [
      {
        :role     => "pxe_server_accord",
        :role_any => true,
        :name     => :pxe_servers,
        :title    => _("PXE Servers")
      },
      {
        :role     => "customization_template_accord",
        :role_any => true,
        :name     => :customization_templates,
        :title    => _("Customization Templates")
      },
      {
        :role     => "pxe_image_type_accord",
        :role_any => true,
        :name     => :pxe_image_types,
        :title    => _("System Image Types")
      },
      {
        :role     => "iso_datastore_accord",
        :role_any => true,
        :name     => :iso_datastores,
        :title    => _("ISO Datastores")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def get_node_info(node, show_list = true)
    @show_list = show_list
    node = valid_active_node(node)
    case x_active_tree
    when :pxe_servers_tree             then pxe_server_get_node_info(node)
    when :customization_templates_tree then template_get_node_info(node)
    when :pxe_image_types_tree         then pxe_image_type_get_node_info(node)
    when :iso_datastores_tree          then iso_datastore_get_node_info(node)
    end
    x_history_add_item(:id => node, :text => @right_cell_text)
    {:view => @view, :pages => @pages}
  end

  def replace_right_cell(options = {})
    nodetype, replace_trees = options.values_at(:nodetype, :replace_trees)
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    # FIXME

    @explorer = true

    trees = build_replaced_trees(replace_trees, %i[pxe_servers pxe_image_types customization_templates iso_datastores])

    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    c_tb = build_toolbar(center_toolbar_filename) unless @in_a_form
    h_tb = build_toolbar('x_history_tb')

    reload_trees_by_presenter(presenter, trees)

    # Rebuild the toolbars
    presenter.reload_toolbars(:history => h_tb)
    case x_active_tree
    when :pxe_servers_tree
      presenter.update(:main_div, r[:partial => "pxe_server_list"])
      right_cell_text = if nodetype == "root"
                          _("All PXE Servers")
                        else
                          case nodetype
                          when 'ps'
                            if @ps.id.blank?
                              _("Adding a new PXE Server")
                            elsif @edit
                              _("Editing PXE Server \"%{name}\"") % {:name => @ps.name}
                            else
                              _("PXE Server \"%{name}\"") % {:name => @ps.name}
                            end
                          when 'pi'
                            _("PXE Image \"%{name}\"") % {:name => @img.name}
                          when 'wi'
                            _("Windows Image \"%{name}\"") % {:name => @wimg.name}
                          end
                        end
    when :pxe_image_types_tree
      presenter.update(:main_div, r[:partial => "pxe_image_type_list"])
      right_cell_text = case nodetype
                        when 'root'
                          _("All System Image Types")
                        when 'pit'
                          if @pxe_image_type.id.blank?
                            _("Adding a new System Image Types")
                          else
                            temp = _("System Image Type \"%{name}\"") % {:name => @pxe_image_type.name}
                            @edit ? "Editing #{temp}" : temp
                          end
                        else
                          _("System Image Type \"%{name}\"") % {:name => @pxe_image_type.name}
                        end
    when :customization_templates_tree
      presenter.update(:main_div, r[:partial => "template_list"])
      if @in_a_form
        right_cell_text =
          if @ct.id.blank?
            _("Adding a new Customization Template")
          elsif @edit
            _("Editing Customization Template \"%{name}\"") % {:name => @ct.name}
          else
            _("Customization Template \"%{name}\"") % {:name => @ct.name}
          end
        # resetting ManageIQ.oneTransition.oneTrans when tab loads
        presenter.reset_one_trans
        presenter.one_trans_ie if %w[save reset].include?(params[:button]) && is_browser_ie?
      end
    when :iso_datastores_tree
      presenter.update(:main_div, r[:partial => "iso_datastore_list"])
      right_cell_text =
        case nodetype
        when 'root' then _("All ISO Datastores")
        when 'isd'  then _("Adding a new ISO Datastore")
        when 'isi'  then _("ISO Image \"%{name}\"") % {:name => @img.name}
        end
    end

    # forcing form buttons to turn off, to prevent Abandon changes popup when replacing right cell after form button was pressed
    presenter[:reload_toolbars][:center] = c_tb if c_tb.present?
    presenter.set_visibility(c_tb.present?, :toolbar)

    # FIXME: check where @right_cell_text is set and replace that with loca variable
    presenter[:right_cell_text] = right_cell_text || @right_cell_text

    if !@view || @in_a_form ||
       (@pages && (@items_per_page == ONE_MILLION || @pages[:items]&.zero?))
      if @in_a_form
        presenter.hide(:toolbar)
        # in case it was hidden for summary screen, and incase there were no records on show_list
        presenter.show(:paging_div, :form_buttons_div)

        action_url, multi_record = case x_active_tree
                                   when :pxe_servers_tree
                                     if x_node == 'root'
                                       "pxe_server_create_update"
                                     else
                                       case x_node.split('-').first
                                       when 'pi' then ["pxe_image_edit", true]
                                       when 'wi' then ["pxe_wimg_edit",  true]
                                       else "pxe_server_create_update"
                                       end
                                     end
                                   when :iso_datastores_tree
                                     if x_node == "root"
                                       "iso_datastore_create"
                                     elsif x_node.split('-').first == "isi"
                                       ["iso_image_edit", true]
                                     else
                                       "iso_datastore_create"
                                     end
                                   when :pxe_image_types_tree
                                     "pxe_image_type_edit"
                                   else
                                     "template_create_update"
                                   end

        presenter.update(:form_buttons_div, r[
          :partial => "layouts/x_edit_buttons",
          :locals  => {
            :record_id    => @edit[:rec_id],
            :action_url   => action_url,
            :multi_record => multi_record,
            :serialize    => true
          }
        ])
      else
        presenter.hide(:form_buttons_div)
      end
      presenter.remove_paging
    else
      presenter.hide(:form_buttons_div)
    end

    presenter[:record_id] = determine_record_id_for_presenter

    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'

    # Save open nodes, if any were added
    presenter[:osf_node] = x_node
    presenter[:lock_sidebar] = @in_a_form && @edit

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs_new'])

    render :json => presenter.for_render
  end

  def get_session_data
    super
    @current_page = session[:pxe_current_page]
  end

  def set_session_data
    super
    session[:pxe_current_page] = @current_page
  end

  def breadcrumbs_options
    @right_cell_text = "editing" unless @edit.nil?
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => _("Networking")},
      ],
    }
  end

  menu_section :inf
end
