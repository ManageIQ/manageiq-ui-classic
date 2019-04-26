class TreeBuilderTemplatesImagesFilter < TreeBuilderVmsFilter
  def initialize(*args)
    @root_class = 'MiqTemplate'
    super(*args)
  end

  def root_options
    {
      :text    => _("All Templates & Images"),
      :tooltip => _("All of the Templates & Images that I can see")
    }
  end
end
