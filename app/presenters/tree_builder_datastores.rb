class TreeBuilderDatastores < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  def initialize(name, type, sandbox, build = true, root = nil)
    @root = root
    @data = Storage.all.each_with_object({}) { |st, h| h[st.id] = st; }
    super(name, type, sandbox, build)
  end

  private

  def tree_init_options(_tree_name)
    {:full_ids => false,
     :add_root => false,
     :lazy     => false}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:checkboxes        => true,
                  :onselect          => "miqOnCheckCUFilters",
                  :highlight_changes => true,
                  :check_url         => "/ops/cu_collection_field_changed/")
  end

  def root_options
    {}
  end

  def x_get_tree_roots(count_only = false, _options)
    nodes = @root.map do |node|
      children = []
      if @data[node[:id]].hosts.present?
        children = @data[node[:id]].hosts.sort_by { |host| host.name.try(:downcase) }.map do |kid|
          {:name => kid.name}
        end
      end

      text = ViewHelper.capture do
        ViewHelper.concat_tag(:strong, node[:name])
        ViewHelper.concat(' [')
        ViewHelper.concat(node[:location])
        ViewHelper.concat(']')
      end

      { :id         => node[:id].to_s,
        :text       => text,
        :icon       => 'fa fa-database',
        :tip        => "#{node[:name]} [#{node[:location]}]",
        :select     => node[:capture] == true,
        :selectable => false,
        :nodes      => children }
    end
    count_only_or_objects(count_only, nodes)
  end

  def x_get_tree_hash_kids(parent, count_only)
    nodes = parent[:nodes].map do |node|
      { :id           => node[:name],
        :text         => node[:name],
        :icon         => 'pficon pficon-container-node',
        :tip          => node[:name],
        :hideCheckbox => true,
        :selectable   => false,
        :nodes        => [] }
    end
    count_only_or_objects(count_only, nodes)
  end
end
