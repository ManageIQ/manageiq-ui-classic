class TreeBuilderSmartproxyAffinity < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]
  has_kids_for MiqServer, [:x_get_server_kids]

  def initialize(name, sandbox, build = true, **params)
    @data = params[:data]
    super(name, sandbox, build)
  end

  private

  def override(node, _object, _pid)
    node[:selectable] = false
  end

  def tree_init_options
    {
      :full_ids     => false,
      :checkboxes   => true,
      :three_checks => true,
      :post_check   => true,
      :oncheck      => 'miqOnCheckGeneric',
      :check_url    => '/ops/smartproxy_affinity_field_changed/'
    }
  end

  def x_get_tree_roots(count_only = false, _options)
    nodes = @data.miq_servers.select(&:is_a_proxy?).sort_by { |s| [s.name, s.id] }
    count_only_or_objects(count_only, nodes)
  end

  def x_get_server_kids(parent, count_only = false)
    nodes = {'host' => 'pficon pficon-container-node', "storage" => 'fa fa-database'}.map do |kid, icon|
      {:id              => "#{parent.id}__#{kid}",
       :icon            => icon,
       :parent          => parent,
       :text            => Dictionary.gettext(kid.camelcase, :type => :model, :notfound => :titleize, :plural => true),
       :selectable      => false,
       :nodes           => @data.send(kid.pluralize).sort_by(&:name),
       :smartproxy_kind => kid}
    end
    count_only_or_objects(count_only, nodes)
  end

  def x_get_tree_hash_kids(parent, count_only = false)
    affinities = parent[:parent].send("vm_scan_#{parent[:smartproxy_kind]}_affinity").collect(&:id) if parent[:parent].present?
    nodes = parent[:nodes].map do |kid|
      {:id              => "#{parent[:id]}_#{kid.id}",
       :icon            => parent[:icon],
       :text            => kid.name,
       :select          => affinities.include?(kid.id),
       :selectable      => false,
       :nodes           => [],
       :smartproxy_kind => parent[:smartproxy_kind]}
    end
    count_only_or_objects(count_only, nodes)
  end
end
