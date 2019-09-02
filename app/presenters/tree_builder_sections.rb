class TreeBuilderSections < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  def initialize(name, sandbox, build, **params)
    @data = params[:data]
    @controller_name = params[:controller_name]
    @current_tenant = params[:current_tenant]
    @sandbox = sandbox
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :full_ids     => true,
      :checkboxes   => true,
      :three_checks => true,
      :oncheck      => "miqOnCheckSections",
      :check_url    => "/#{@controller_name}/sections_field_changed/"
    }
  end

  def x_get_tree_roots
    nodes = []
    group = nil
    @data.master_list.each_slice(3) do |section, _records, _fields|
      if group.blank? || section[:group] != group
        group = section[:group]
        nodes.push(:id         => "group_#{section[:group]}",
                   :text       => section[:group] == "Categories" ? _("%{current_tenant} Tags") % {:current_tenant => @current_tenant} : _(section[:group]),
                   :tip        => _(section[:group]),
                   :image      => false,
                   :checked    => true,
                   :selectable => false,
                   :nodes      => [section])
      else
        nodes.last[:nodes].push(section)
      end
    end
    nodes.each do |node|
      checked = node[:nodes].count { |kid| @data.include[kid[:name]][:checked] } # number of checked kids
      node[:checked] = if checked.zero?
                         false
                       elsif checked < node[:nodes].size
                         'undefined'
                       else
                         true
                       end
    end
    count_only_or_objects(false, nodes)
  end

  def x_get_tree_hash_kids(parent, count_only)
    nodes = parent[:nodes].map do |kid|
      {:id         => "group_#{kid[:group]}:#{kid[:name]}",
       :text       => _(kid[:header]),
       :tip        => _(kid[:header]),
       :image      => false,
       :checked    => @data.include[kid[:name]][:checked],
       :selectable => false,
       :nodes      => []}
    end
    count_only_or_objects(count_only, nodes)
  end
end
