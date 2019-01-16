module TextualMixins::TextualName
  def textual_name
    {:label => _('Name'), :value => @record.name}
  end
end
