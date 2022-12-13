class ServiceTemplateCatalogController < ApplicationController
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericListMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin


  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data
  after_action :title

  EDIT_CATALOG_FEATURES = %w[
    atomic_catalogitem_edit
    catalogitem_edit
    atomic_catalogitem_new
    catalogitem_new
  ].freeze

  def title
    @page_title = _("Catalogs")
  end

  def self.model
    @model ||= ServiceTemplateCatalog
  end

  def self.table_name
    @table_name ||= "service_template_catalogs"
  end

  def show_list
    assert_privileges("catalog_service_template_catalogs_show_list")
    process_show_list(:dbname => :service_template_catalogs, :gtl_dbname => :service_template_catalogs)
  end

  def show
    assert_privileges("catalog_service_template_catalogs_show")
    @record = ServiceTemplateCatalog.find(params[:id])
    @title = @record&.name
    @record_service_templates = Rbac.filtered(@record.service_templates, :named_scope => :public_service_templates)
  end

  def new
  end

  # def service_catalog_item
  #   @record = ServiceTemplateCatalog.find(params[:id].to_i)
  #   @service_templates = @record.service_templates.where("id = ?", params[:item].to_i)&.first
  #   @title = @service_templates&.name
  # end


  def assert_privileges_for_servicetemplate_edit
    if params[:pressed].present? && EDIT_CATALOG_FEATURES.include?(params[:pressed])
      assert_privileges(params[:pressed])
    elsif params[:button].blank?
      assert_privileges('atomic_catalogitem_edit')
    end
  end

  def find_record_with_rbac(service_template, record_id)
    options = @find_with_aggregates ? {:named_scope => :with_aggregates} : {}
    super(service_template, record_id, options)
  end

  def edit
    assert_privileges_for_servicetemplate_edit

    checked_id = find_checked_items.first || params[:id]
    

    @sb[:cached_waypoint_ids] = MiqAeClass.waypoint_ids_for_state_machines
    @record = checked_id.present? ? find_record_with_rbac(ServiceTemplateCatalog, checked_id) : ServiceTemplate.new
    puts "@record=====#{@record.inspect}"
    @sb[:st_form_active_tab] = "basic"
    composite_type = @record.service_type == "composite"
    new_atomic_item = params[:pressed] == "atomic_catalogitem_new" || (params[:button].present? && session[:edit][:new][:service_type] == "atomic")
    if checked_id.present? && composite_type || checked_id.nil? && !new_atomic_item
      st_edit
    else
      atomic_st_edit
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Services")},
        {:title => _("Catalogs"), :url => controller_url},
      ],
    }
  end
  toolbar :servicetemplatecatalog, :servicetemplatecatalogs
end
