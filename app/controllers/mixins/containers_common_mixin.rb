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
    generic_button_setup
    handle_button_pressed(params[:pressed])
  end

  private

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
