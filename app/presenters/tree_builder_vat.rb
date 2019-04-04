class TreeBuilderVat < TreeBuilderDatacenter
  has_kids_for Datacenter, %i[x_get_tree_datacenter_kids]
  has_kids_for EmsFolder, %i[x_get_tree_folder_kids]

  def initialize(name, type, sandbox, build = true, **params)
    sandbox[:vat] = params[:vat] if params[:vat]
    @vat = sandbox[:vat]
    @user_id = User.current_userid
    super(name, type, sandbox, build, **params)
  end

  private

  def root_options
    {
      :text    => @root.name,
      :tooltip => @root.name,
      :image   => @root.decorate.fileicon
    }
  end

  def x_get_tree_roots(count_only = false, _options)
    root_child = @root.children.first
    count_only_or_many_objects(count_only, root_child.folders_only, root_child.datacenters_only, "name")
  end

  def x_get_tree_datacenter_kids(parent, count_only = false)
    # Get rid of unwanted folder level
    parent = @vat ? parent.folders.find { |x| x.name == "vm" } : parent.folders.find { |x| x.name == "host" }
    if parent.nil?
      count_only ? 0 : []
    else
      x_get_tree_folder_kids(parent, count_only)
    end
  end

  def x_get_tree_folder_kids(parent, count_only)
    objects = count_only ? 0 : []

    if parent.name == "Datacenters"
      objects = count_only_or_many_objects(count_only, Rbac.filtered(parent.folders_only), Rbac.filtered(parent.datacenters_only), "name")
    elsif parent.name == "host" && parent.parent.kind_of?(Datacenter)
      unless @vat
        objects = count_only_or_many_objects(count_only, Rbac.filtered(parent.folders_only), Rbac.filtered(parent.clusters), Rbac.filtered(parent.hosts), "name")
      end
    elsif parent.name == "datastore" && parent.parent.kind_of?(Datacenter)
      # Skip showing the datastore folder and sub-folders
    elsif parent.name == "vm" && parent.parent.kind_of?(Datacenter)
      if @vat
        objects = count_only_or_many_objects(count_only, Rbac.filtered(parent.folders_only), Rbac.filtered(parent.vms), "name")
      end
    else
      objects = count_only_or_many_objects(count_only, Rbac.filtered(parent.folders_only), Rbac.filtered(parent.datacenters_only),
                                           Rbac.filtered(parent.clusters), Rbac.filtered(parent.hosts), Rbac.filtered(parent.vms), "name")
    end
    objects
  end
end
