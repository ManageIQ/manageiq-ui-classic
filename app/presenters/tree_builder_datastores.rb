class TreeBuilderDatastores < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]
  has_kids_for Storage, [:x_get_tree_storage_kids]

  def initialize(name, sandbox, build = true, **params)
    @storages = Storage.in_my_region.includes(:hosts).select(:id, :name, :location)
    @root = params[:root]
    super(name, sandbox, build)
  end

  private

  def override(node, object)
    if object.kind_of?(Storage)
      node.checked = @root[object.id][:capture]

      node.tooltip = "#{object.name} [#{object.location}]"
      node.text = ViewHelper.capture do
        ViewHelper.concat_tag(:strong, object.name)
        ViewHelper.concat(' [')
        ViewHelper.concat(object.location)
        ViewHelper.concat(']')
      end
    else
      node.hide_checkbox = true
    end

    node.selectable = false
  end

  def tree_init_options
    {
      :full_ids   => false,
      :checkboxes => true,
      :oncheck    => "miqOnCheckGeneric",
      :check_url  => "/ops/cu_collection_field_changed/"
    }
  end

  def x_get_tree_roots
    count_only_or_objects(false, @storages)
  end

  def x_get_tree_storage_kids(parent, count_only)
    nodes = parent.hosts.sort_by { |host| host.name.try(:downcase) }
    count_only_or_objects(count_only, nodes)
  end
end
