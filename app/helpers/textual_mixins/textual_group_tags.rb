module TextualMixins::TextualGroupTags
  def textual_group_tags
    TextualTags.new(_("Smart Management"), %i(tags))
  end
end
