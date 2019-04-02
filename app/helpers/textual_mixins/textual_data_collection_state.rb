module TextualMixins::TextualDataCollectionState
  def textual_data_collection_state
    state = @record.enabled?
    quad_icon = QuadiconHelper.machine_state(state ? 'on' : 'paused')
    quad_icon[:icon] = quad_icon.delete(:fonticon)

    {
      :label => _("Data Collection"),
      :value => state ? _("Running") : _("Paused")
    }.merge(quad_icon)
  end
end
