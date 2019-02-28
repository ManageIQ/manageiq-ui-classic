class TreeBuilderImagesFilter < TreeBuilderVmsFilter
  def tree_init_options
    super.update(:leaf => 'ManageIQ::Providers::CloudManager::Template')
  end

  def root_options
    {
      :text    => _("All Images"),
      :tooltip => _("All of the Images that I can see")
    }
  end
end
