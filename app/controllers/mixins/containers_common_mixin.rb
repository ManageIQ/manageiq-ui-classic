module ContainersCommonMixin
  extend ActiveSupport::Concern

  include Mixins::GenericButtonMixin

  def show
    # fix breadcrumbs - remove displaying 'topology' when navigating to any container related entity summary page
    if @breadcrumbs.present? && (@breadcrumbs.last[:name].eql? 'Topology')
      @breadcrumbs.clear
    end
    @display = params[:display] || "main" unless pagination_or_gtl_request?
    @lastaction = "show"
    @showtype = "main"
    @record = identify_record(params[:id])
    show_container(@record, controller_name, display_name)
  end

  def button
    restore_edit_for_search
    copy_sub_item_display_value_to_params
    save_current_page_for_refresh
    set_default_refresh_div

    # Handle Toolbar Policy Tag Button

    model = self.class.model
    if params[:pressed] == "#{params[:controller]}_tag"
      tag(model)

      return if @flash_array.nil? # Tag screen showing
    end

    if [ContainerReplicator, ContainerGroup, ContainerNode, ContainerImage].include?(model)
      assign_policies(model) if params[:pressed] == "#{model.name.underscore}_protect"
      check_compliance(model) if params[:pressed] == "#{model.name.underscore}_check_compliance"
    end

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

  private

  # Scan all selected or single displayed image(s)
  def scan_images
    assert_privileges("image_scan")
    showlist = @lastaction == "show_list"
    ids = showlist ? find_checked_items : find_current_item(ContainerImage)

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
    ids = showlist ? find_checked_items : find_current_item(model)

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
      [params[:id].to_i]
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

  def button_sub_item_display_values
    ["#{params[:controller]}s"]
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
