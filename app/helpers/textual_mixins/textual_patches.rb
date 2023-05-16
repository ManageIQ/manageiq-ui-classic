module TextualMixins::TextualPatches
  def textual_patches
    os = @record.os_image_name.downcase
    return nil if os == "unknown" || os.include?('linux')

    num = @record.number_of(:patches)
    h = {:label => _("Patches"), :icon => "fa fa-shield", :value => num}
    if num.positive?
      h[:title] = n_("Show the Patch defined on this VM", "Show the Patches defined on this VM", num)
      h[:explorer] = true
      h[:link] = url_for_only_path(:action => 'patches', :id => @record, :db => controller.controller_name)
    end
    h
  end
end
