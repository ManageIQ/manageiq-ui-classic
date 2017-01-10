class TreeBuilderMiqActionCategory < TreeBuilder
  has_kids_for Classification, [:x_get_tree_classification_kids]

  private

  def override(node, object, _pid, _options)
    leaf = !object.category?
    image = leaf ? nil : "100/tag.png"
    node[:cfmeNoClick] = !leaf
    node[:image] = image && ActionController::Base.helpers.image_path(image)
    node
  end

  def initialize(name, type, sandbox, build = true, tenant_name = nil)
    @tenant_name = tenant_name
    super(name, type, sandbox, build)
  end

  def tree_init_options(_tree_name)
    {
      :expand => true,
      :lazy   => false
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(
      :id_prefix => "cat_tree",
      :click_url => "/miq_policy/action_tag_pressed/",
      :onclick   => "miqOnClickTagCat"
    )
  end

  def root_options
    {
      :title   => @tenant_name,
      :tooltip => @tenant_name,
      :image   => "100/tag.png"
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    cats = Classification.categories.select(&:show)
    cats = cats.select { |c| c.entries.any? && c.read_only == false }
    count_only_or_objects(count_only, cats, :description)
  end

  def x_get_tree_classification_kids(c, count_only)
    count_only_or_objects(count_only, c.entries, :description)
  end
end
