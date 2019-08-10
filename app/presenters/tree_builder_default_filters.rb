class TreeBuilderDefaultFilters < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  NAV_TAB_PATH = {
    :container                                     => %w[Containers Containers],
    :containergroup                                => %w[Containers Containers\ Groups],
    :containerservice                              => %w[Containers Services],
    :host                                          => %w[Infrastructure Hosts],
    :miqtemplate                                   => %w[Services Workloads Templates\ &\ Images],
    :service                                       => %w[Services My\ Services],
    :storage                                       => %w[Infrastructure Datastores],
    :vm                                            => %w[Services Workloads VMs\ &\ Instances],
    :"manageiq::providers::cloudmanager::template" => %w[Cloud Instances Images],
    :"manageiq::providers::inframanager::template" => %w[Infrastructure Virtual\ Machines Templates],
    :"manageiq::providers::cloudmanager::vm"       => %w[Cloud Instances Instances],
    :"manageiq::providers::inframanager::vm"       => %w[Infrastructure Virtual\ Machines VMs],
    :physicalserver                                => %w[Physical\ Infrastructure Servers],
    :physicalswitch                                => %w[Physical\ Infrastructure Switches]
  }.freeze

  def prepare_data(data)
    data.sort_by { |s| [NAV_TAB_PATH[s.db.downcase.to_sym], s.description.downcase] }
        .each_with_object({}) do |search, nodes|
      folder_nodes = NAV_TAB_PATH[search[:db].downcase.to_sym]
      path = nodes.fetch_path(folder_nodes) ? nodes.fetch_path(folder_nodes) : nodes.store_path(folder_nodes, [])
      path.push(search)
    end
  end

  def initialize(name, sandbox, build = true, **params)
    @data = prepare_data(params[:data])
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :full_ids   => true,
      :checkboxes => true,
      :check_url  => "/configuration/filters_field_changed/",
      :oncheck    => "miqOnCheckGeneric"
    }
  end

  def x_get_tree_roots(count_only)
    roots = @data.keys.map do |folder|
      {:id           => folder,
       :text         => folder,
       :icon         => "pficon pficon-folder-close",
       :tip          => folder,
       :selectable   => false,
       :hideCheckbox => true}
    end
    count_only_or_objects(count_only, roots)
  end

  def x_get_tree_hash_kids(parent, count_only)
    unless parent[:id].kind_of?(Integer)
      path = parent[:id].split('_')
      kids = @data.fetch_path(path)
      nodes = if kids.kind_of?(Hash)
                folders = kids.keys
                folders.map do |folder|
                  {:id           => "#{parent[:id]}_#{folder}",
                   :text         => folder,
                   :icon         => "pficon pficon-folder-close",
                   :tip          => folder,
                   :selectable   => false,
                   :hideCheckbox => true}
                end
              else
                kids.map do |kid|
                  {:id         => kid[:id],
                   :text       => kid[:description],
                   :icon       => 'fa fa-filter',
                   :tip        => kid[:description],
                   :selectable => false,
                   :select     => kid[:search_key] != "_hidden_"}
                end
              end
    end
    count_only_or_objects(count_only, nodes)
  end
end
