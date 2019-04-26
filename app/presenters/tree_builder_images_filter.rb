class TreeBuilderImagesFilter < TreeBuilderVmsFilter
  def initialize(*args)
    @root_class = 'ManageIQ::Providers::CloudManager::Template'
    super(*args)
  end

  def root_options
    {
      :text    => _("All Images"),
      :tooltip => _("All of the Images that I can see")
    }
  end
end
