module TextualMixins::TextualPowerState
  def textual_power_state
    state = @record.current_state.downcase
    state = "unknown" if state.blank?
    h = {:label => _("Power State"), :value => state}
    h[:image] = "svg/currentstate-#{@record.template? ? 'template' : state}.svg"
    h
  end
end
