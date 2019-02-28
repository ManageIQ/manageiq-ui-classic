class TreeBuilderImagesFilter < TreeBuilderVmsFilter
  def tree_init_options
    super.update(:leaf => 'ManageIQ::Providers::CloudManager::Template')
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:tree_id   => "images_filter_treebox",
                  :tree_name => "images_filter_tree")
  end

  def root_options
    {
      :text    => _("All Images"),
      :tooltip => _("All of the Images that I can see")
    }
  end
end
