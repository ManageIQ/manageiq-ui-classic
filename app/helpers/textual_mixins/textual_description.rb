module TextualMixins::TextualDescription
  def textual_description
    {:label => _('Description'), :value => @record.description}
  end
end
