# frozen_string_literal: true

module OpsController::Settings::LabelTagMapping
  extend ActiveSupport::Concern

  # TODO: Multi-provider support is hacky:
  # --------------------------------------
  # Currently we store in labeled_resource_type an arbitrary string that
  # sometimes looks like a model name, sometimes fake string like "Vm" -
  # all that matters is these strings match what refresh passes to `map_labels`.
  #
  # In any case, this requires different providers use disjoint sets of strings.
  MappableEntity = Struct.new(:prefix, :model)

  ALL_ENTITIES = "_all_entities_"

  MAPPABLE_ENTITIES = {
    # TODO: support per-provider "All Amazon" etc?
    # Currently we have only global "All".
    # Global "All" categories are named "kubernetes::..." for backward compatibility.
    nil                   => MappableEntity.new("kubernetes::",
                                                nil),
    ALL_ENTITIES          => MappableEntity.new(nil,
                                                "All Entities"),
    "Vm"                  => MappableEntity.new("amazon:vm:",
                                                "ManageIQ::Providers::Amazon::CloudManager::Vm"),
    "VmIBM"               => MappableEntity.new("ibm:vm:",
                                                "ManageIQ::Providers::IbmCloud::VPC::CloudManager::Vm"),
    "VmOpenstack"         => MappableEntity.new("openstack:vm:",
                                                "ManageIQ::Providers::Openstack::CloudManager::Vm"),
    "VmAzure"             => MappableEntity.new("azure:vm:",
                                                "ManageIQ::Providers::Azure::CloudManager::Vm"),
    "VmVmware"            => MappableEntity.new("vmware:vm:",
                                                "ManageIQ::Providers::Vmware::InfraManager::Vm"),
    "Image"               => MappableEntity.new("amazon:image:",
                                                "ManageIQ::Providers::Amazon::CloudManager::Template"),
    "ContainerProject"    => MappableEntity.new("kubernetes:container_project:",
                                                "ContainerProject"),
    "ContainerRoute"      => MappableEntity.new("kubernetes:container_route:",
                                                "ContainerRoute"),
    "ContainerNode"       => MappableEntity.new("kubernetes:container_node:",
                                                "ContainerNode"),
    "ContainerReplicator" => MappableEntity.new("kubernetes:container_replicator:",
                                                "ContainerReplicator"),
    "ContainerService"    => MappableEntity.new("kubernetes:container_service:",
                                                "ContainerService"),
    "ContainerGroup"      => MappableEntity.new("kubernetes:container_group:",
                                                "ContainerGroup"),
    "ContainerBuild"      => MappableEntity.new("kubernetes:container_build:",
                                                "ContainerBuild"),
  }.freeze

  def label_tag_mapping_edit
    case params[:button]
    when "cancel"
      @lt_map = session[:edit][:lt_map] if session[:edit] && session[:edit][:lt_map]
      if !@lt_map || @lt_map.id.blank?
        add_flash(_("Add of new Provider Tag Mapping was cancelled by the user"))
      else
        add_flash(_("Edit of Provider Tag Mapping \"%{name}\" was cancelled by the user") % {:name => @lt_map.label_name})
      end
      get_node_info(x_node)
      @lt_map = @edit = session[:edit] = nil # clean out the saved info
      replace_right_cell(:nodetype => @nodetype)
    when "save", "add"
      id = params[:id] || "new"
      return unless load_edit("label_tag_mapping_edit__#{id}", "replace_cell__explorer")

      @lt_map = @edit[:lt_map] if @edit && @edit[:lt_map]
      if @edit[:new][:label_name].blank?
        add_flash(_("Label is required"), :error)
      end
      if @edit[:new][:category].blank?
        add_flash(_("Category is required"), :error)
      end
      unless @flash_array.nil?
        javascript_flash
        return
      end
      if params[:button] == "add"
        label_tag_mapping_add(@edit[:new][:entity], @edit[:new][:label_name], @edit[:new][:category])
      else # save
        label_tag_mapping_update(@lt_map.id, @edit[:new][:category])
      end
    when "reset", nil # Reset or first time in
      if params[:id]
        @lt_map = ProviderTagMapping.find(params[:id])
        lt_map_set_form_vars
      else
        lt_map_set_new_form_vars
      end
      @in_a_form = true
      session[:changed] = false
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "ltme")
    end
  end

  def entity_ui_name_or_all(entity)
    if entity
      if entity == ALL_ENTITIES
        _(MAPPABLE_ENTITIES[entity].model)
      else
        model = MAPPABLE_ENTITIES[entity].model
        ui_lookup(:model => model)
      end
    else
      _("<All>")
    end
  end

  def entity_options
    MAPPABLE_ENTITIES.collect do |entity, _provider|
      [entity_ui_name_or_all(entity), entity]
    end
  end

  def label_tag_mapping_get_all
    # Current UI only supports any-value -> category mappings
    mappings = ProviderTagMapping.in_my_region.where(:label_value => nil)

    # This renders into label_tag_mapping_form view, fields are different from other
    # functions here, notably `:entity` is the translated ui name.
    @lt_mapping = []
    @any_mapping_is_all_entities = false
    mappings.each do |m|
      lt_map = {}
      lt_map[:id] = m.id
      lt_map[:entity] = entity_ui_name_or_all(m.labeled_resource_type)
      lt_map[:label_name] = m.label_name
      tag_classification = m.tag.classification
      lt_map[:category] = cat_description_without_prefix(tag_classification.description)
      @any_mapping_is_all_entities = true if m.labeled_resource_type == ALL_ENTITIES
      @lt_mapping.push(lt_map)
    end
  end

  # Set form variables for mapping edit (initially or after reset)
  def lt_map_set_form_vars
    @edit = {}
    @edit[:lt_map] = @lt_map
    @edit[:new] = {}
    @edit[:key] = "label_tag_mapping_edit__#{@lt_map.id || "new"}"
    @edit[:new][:entity] = @lt_map.labeled_resource_type
    @edit[:new][:label_name] = @lt_map.label_name
    @edit[:new][:category] = cat_description_without_prefix(@lt_map.tag.classification.description)
    @edit[:current] = copy_hash(@edit[:new])
    @edit[:new][:options] = entity_options
    session[:edit] = @edit
  end

  # Set form variables for mapping add
  def lt_map_set_new_form_vars
    @edit = {}
    # no :lt_map
    @edit[:new] = {}
    @edit[:key] = "label_tag_mapping_edit__new"
    @edit[:new][:entity] = nil
    @edit[:new][:label_name] = nil
    @edit[:new][:category] = nil
    @edit[:current] = copy_hash(@edit[:new])
    @edit[:new][:options] = entity_options
    session[:edit] = @edit
  end

  def categories_for_select
    Classification.categories.reject(&:read_only?).sort_by(&:description).map(&:description)
  end

  # AJAX driven routine to check for changes in ANY field on the user form
  def label_tag_mapping_field_changed
    return unless load_edit("label_tag_mapping_edit__#{params[:id]}", "replace_cell__explorer")

    lt_map_get_form_vars
    @changed = (@edit[:new] != @edit[:current])

    controller_object = self

    render :update do |page|
      page << javascript_prologue

      if params[:entity]
        page.replace("tag_category_div", :partial => "ops/label_tag_mapping/tag_category",
                                         :locals  => controller_object.tag_category_parameters_for_haml)
      end

      if @refresh_div
        page.replace(@refresh_div,
                     :partial => @refresh_partial,
                     :locals  => {:type       => "provider_tag_mapping",
                                  :action_url => 'label_tag_mapping_field_changed'})
      end
      page << javascript_for_miq_button_visibility_changed(@changed)
    end
  end

  # Get variables from label_tag_mapping edit form
  def lt_map_get_form_vars
    @lt_map = @edit[:lt_map]
    copy_params_if_present(@edit[:new], params, %i[entity label_name category])
  end

  def flash_message_on_validation_error_for(validation_error, entity, label_name, cat_description)
    entity_name = entity_ui_name_or_all(entity)
    variables = {:entity => entity_name, :label => label_name, :cat_description => cat_description}
    message = if validation_error == :unique_mapping
                _("Mapping for \"%{entity}\", Label \"%{label}\" and Tag Category \"%{cat_description}\" already exists") % variables
              else
                _("Mapping for \"%{entity}\", Label \"%{label}\": Tag Category \"%{cat_description}\" must exist") % variables
              end

    add_flash(message, :error)
    javascript_flash
  end

  def classification_lookup_with_cache_by(cat_description)
    @classification ||= {}
    @classification[cat_description] ||= Classification.lookup_category_by_description(cat_description)
  end

  def category_for_mapping(cat_description, entity)
    if entity == ALL_ENTITIES
      classification_lookup_with_cache_by(cat_description)
    else
      Classification.create_category!(:name         => category_name_from_description(entity, cat_description),
                                      :description  => cat_description_with_prefix(entity, cat_description),
                                      :single_value => true,
                                      :read_only    => true)
    end
  end

  def category_name_from_description(entity, cat_description)
    cat_prefix = MAPPABLE_ENTITIES[entity].prefix
    cat_prefix.to_s + Classification.sanitize_name(cat_description.tr("/", ":"))
  end

  def find_prefixed_category_for_mapping_by(cat_description, entity)
    # UI currently can't allow 2 mappings for same (entity, label).
    category = Classification.is_category.read_only.find_by(:single_value => true, :description => cat_description)
    category || Classification.lookup_by_name(category_name_from_description(entity, cat_description))
  end

  def validate_mapping(cat_description, entity, label_name)
    tag = classification_lookup_with_cache_by(cat_description)&.tag
    return :unique_mapping if tag && ProviderTagMapping.where(:label_name => label_name, :tag => tag).exists?

    if entity == ALL_ENTITIES
      :tag_not_found unless classification_lookup_with_cache_by(cat_description)
    elsif find_prefixed_category_for_mapping_by(cat_description, entity)
      :unique_mapping
    end
  end

  def label_tag_mapping_add(entity, label_name, cat_description)
    if (error = validate_mapping(cat_description, entity, label_name))
      flash_message_on_validation_error_for(error, entity, label_name, cat_description)
      return
    end

    begin
      ActiveRecord::Base.transaction do
        category = category_for_mapping(cat_description, entity)
        ProviderTagMapping.create!(:labeled_resource_type => entity,
                                   :label_name            => label_name,
                                   :tag                   => category.tag)
      end
    rescue StandardError => bang
      add_flash(_("Error during 'add': %{message}") % {:message => bang.message}, :error)
      javascript_flash
    else
      add_flash(_("Provider Tag Mapping \"%{name}\" was added") % {:name => label_name})
      get_node_info(x_node)
      @lt_map = @edit = session[:edit] = nil # clean out the saved info
      replace_right_cell(:nodetype => "root")
    end
  end

  def label_tag_mapping_update(id, cat_description)
    mapping = ProviderTagMapping.find(id)
    begin
      if mapping.labeled_resource_type == ALL_ENTITIES
        update_category = classification_lookup_with_cache_by(cat_description)
        # Should not create a new category if "All entities". The chosen category should exist
        if update_category.nil?
          flash_message_on_validation_error_for(:tag_not_found, mapping.labeled_resource_type, mapping.label_name, cat_description)
          return
        end
        mapping.tag = update_category.tag
        mapping.save!
      else
        update_category             = mapping.tag.classification
        update_category.name        = category_name_from_description(mapping.labeled_resource_type, cat_description)
        update_category.description = cat_description_with_prefix(mapping.labeled_resource_type, cat_description)
        update_category.save!
      end
    rescue StandardError => bang
      add_flash(_("Error during 'save': %{message}") % {:message => bang.message}, :error)
      javascript_flash
    else
      add_flash(_("Provider Tag Mapping \"%{name}\" was saved") % {:name => mapping.label_name})
      get_node_info(x_node)
      @lt_map = @edit = session[:edit] = nil # clean out the saved info
      replace_right_cell(:nodetype => "root")
    end
  end

  def label_tag_mapping_delete
    mapping = ProviderTagMapping.find(params[:id])
    category = mapping.tag.classification
    label_name = mapping.label_name

    deleted = false
    ActiveRecord::Base.transaction do
      deleted = if mapping.labeled_resource_type == ALL_ENTITIES
                  # Don't delete the category in this case because it was created outside of tag mapping
                  # Note: As a side effect, taggings of this category will not be removed from resources that had this mapping
                  mapping.destroy
                else
                  # delete mapping and category - will indirectly delete tags
                  mapping.destroy && category.destroy
                end
    end

    if deleted
      add_flash(_("Provider Tag Mapping \"%{name}\": Delete successful") % {:name => label_name})
      label_tag_mapping_get_all
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page.replace_html('settings_label_tag_mapping', :partial => 'settings_label_tag_mapping_tab')
      end
    else
      mapping.errors.each { |field, msg| add_flash("#{field.to_s.capitalize} #{msg}", :error) }
      category.errors.each { |field, msg| add_flash("#{field.to_s.capitalize} #{msg}", :error) }
      javascript_flash
    end
  end

  def cat_description_with_prefix(entity, cat_description)
    prefix = MAPPABLE_ENTITIES[entity].prefix.chomp(":")
    "#{prefix}|#{cat_description}"
  end

  def cat_description_without_prefix(cat_description)
    cat_description.sub(/^[^\|]+\|/, "")
  end

  included do
    helper_method :tag_category_parameters_for_haml

    def tag_category_parameters_for_haml
      {:lt_map       => @lt_map,
       :categories   => categories_for_select,
       :category     => @edit[:new][:category] || categories_for_select.first,
       :all_entities => @edit[:new][:entity] == ALL_ENTITIES}
    end
  end
end
