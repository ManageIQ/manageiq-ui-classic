class TreeBuilderPxeServers < TreeBuilder
  has_kids_for PxeServer, %i[x_get_tree_pxe_server_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    {
      :text    => t = _("All PXE Servers"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    count_only_or_objects(count_only, PxeServer.all, "name")
  end

  def x_get_tree_pxe_server_kids(object, count_only)
    pxe_images = object.pxe_images
    win_images = object.windows_images
    if count_only
      open_node("xx-pxe_xx-#{object.id}")
      open_node("xx-win_xx-#{object.id}")
      pxe_images.size + win_images.size
    else
      objects = []
      unless pxe_images.empty?
        open_node("pxe_xx-#{object.id}")
        objects.push(:id   => "pxe_xx-#{object.id}",
                     :text => _("PXE Images"),
                     :icon => "pficon pficon-folder-close",
                     :tip  => _("PXE Images"))
      end
      unless win_images.empty?
        open_node("win_xx-#{object.id}")
        objects.push(:id   => "win_xx-#{object.id}",
                     :text => _("Windows Images"),
                     :icon => "pficon pficon-folder-close",
                     :tip  => _("Windows Images"))
      end
      objects
    end
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    nodes = (object[:full_id] || object[:id]).split('_')
    ps = PxeServer.find_by(:id => nodes.last.split('-').last)
    objects = if nodes[0].end_with?("pxe")
                ps.pxe_images
              elsif nodes[0].end_with?("win")
                ps.windows_images
              end
    count_only_or_objects(count_only, objects, "name")
  end
end
