class TreeBuilderButtons < TreeBuilderAeCustomization
  include CustomButtonsMixin
  has_kids_for CustomButtonSet, [:x_get_tree_aset_kids]

  private

  def tree_init_options(_tree_name)
    {:leaf => "CustomButton", :open_all => true, :full_ids => true}
  end

  def root_options
    {
      :title   => t = _("Object Types"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(_count_only, _options)
    resolve = {}
    CustomButton.button_classes.each { |db| resolve[db] = ui_lookup(:model => db) }
    @sb[:target_classes] = resolve.invert
    resolve = Array(resolve.invert).sort
    resolve.collect do |typ|
      {:id => "ab_#{typ[1]}", :text => typ[0], :tip => typ[0]}.merge(buttons_node_image(typ[1]))
    end
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    nodes = object[:id].split('_')
    objects = CustomButtonSet.find_all_by_class_name(nodes[1])
    # add as first element of array
    objects.unshift(
      CustomButtonSet.new(:name => "[Unassigned Buttons]|ub-#{nodes[1]}", :description => "[Unassigned Buttons]")
    )
    count_only_or_objects(count_only, objects)
  end

  def buttons_node_image(node)
    case node
    when 'ExtManagementSystem' then {:icon  => 'pficon pficon-server'}
    when 'CloudTenant'         then {:icon  => 'pficon-cloud-tenant'}
    when 'EmsCluster'          then {:icon  => 'pficon pficon-cluster'}
    when 'Host'                then {:icon  => 'pficon pficon-screen'}
    when 'MiqTemplate'         then {:icon  => 'product product-template'}
    when 'Service'             then {:icon  => 'pficon pficon-service'}
    when 'Storage'             then {:icon  => 'fa fa-database'}
    when 'Vm'                  then {:icon  => 'pficon pficon-virtual-machine'}
    end
  end
end
