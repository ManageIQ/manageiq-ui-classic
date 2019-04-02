module TextualMixins::TextualAdvancedSettings
  def textual_advanced_settings
    num = @record.number_of(:advanced_settings)
    h = {:label => _("Advanced Settings"), :icon => "pficon pficon-settings", :value => num}
    if num.positive?
      h[:title] = _("Show the advanced settings on this VM")
      h[:explorer] = true
      h[:link] = url_for_only_path(:action => 'advanced_settings', :id => @record, :db => controller.controller_name)
    end
    h
  end
end
