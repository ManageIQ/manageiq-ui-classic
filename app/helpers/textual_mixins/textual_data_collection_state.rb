module TextualMixins::TextualDataCollectionState
  def textual_data_collection_state
    state = @record.enabled?
    h = {:label => _("Data Collection"), :value => state ? _("Running") : _("Paused")}
    h[:image] = if state
                  "svg/currentstate-on.svg"
                else
                  "svg/currentstate-paused.svg"
                end
    h
  end
end
