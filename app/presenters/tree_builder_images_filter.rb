class TreeBuilderImagesFilter < TreeBuilderVmsFilter
  private

  def root_options
    {
      :text    => _("All Images"),
      :tooltip => _("All of the Images that I can see")
    }
  end

  def filter_root_class
    'ManageIQ::Providers::CloudManager::Template'
  end
end
