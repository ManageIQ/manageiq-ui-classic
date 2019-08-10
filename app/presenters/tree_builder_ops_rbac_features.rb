class TreeBuilderOpsRbacFeatures < TreeBuilder
  has_kids_for Menu::Section,     [:x_get_tree_section_kids]
  has_kids_for Menu::Item,        [:x_get_tree_item_kids]
  has_kids_for MiqProductFeature, [:x_get_tree_feature_kids]

  attr_reader :node_id_prefix, :features, :editable

  def initialize(name, sandbox, build, **params)
    @node_id_prefix = params[:role].id || "new"
    @editable = params[:editable]
    @features = params[:role].miq_product_features.map(&:identifier)

    # Make sure tree_state doesn't hold on to old data between requests
    TreeState.new(sandbox).remove_tree(name)

    super(name, sandbox, build)
  end

  private

  def x_get_tree_roots(count_only)
    top_nodes = Menu::Manager.items.select do |section|
      Vmdb::PermissionStores.instance.can?(section.id) && !section.kind_of?(Menu::Item)
    end

    top_nodes += %w[all_vm_rules api_exclusive sui ops_explorer].collect do |additional_feature|
      MiqProductFeature.obj_features[additional_feature] &&
        MiqProductFeature.obj_features[additional_feature][:feature]
    end

    count_only_or_objects(count_only, top_nodes.compact)
  end

  def x_get_tree_section_kids(parent, count_only = false)
    kids = parent.items.reject do |item|
      item.kind_of?(Menu::Item) && !MiqProductFeature.feature_exists?(item.feature)
    end

    count_only_or_objects(count_only, kids)
  end

  def x_get_tree_item_kids(parent, count_only = false)
    kids = MiqProductFeature.obj_feature_children(parent.feature)
    count_only_or_objects(count_only, kids)
  end

  def x_get_tree_feature_kids(parent, count_only = false)
    kids = MiqProductFeature.obj_feature_children(parent.identifier) || []
    count_only_or_objects(count_only, kids)
  end

  def tree_init_options
    {
      :checkboxes   => true,
      :three_checks => true,
      :post_check   => true,
      :check_url    => "/ops/rbac_role_field_changed/",
      :oncheck      => @editable ? "miqOnCheckGeneric" : false
    }
  end

  def root_options
    root_feature = MiqProductFeature.feature_root
    root_details = MiqProductFeature.feature_details(root_feature)

    {
      :key        => "#{@node_id_prefix}__#{root_feature}",
      :icon       => "pficon pficon-folder-close",
      :text       => _(root_details[:name]),
      :tooltip    => _(root_details[:description]) || _(root_details[:name]),
      :expand     => true,
      :selectable => false,
      :checkable  => @editable
    }
  end
end
