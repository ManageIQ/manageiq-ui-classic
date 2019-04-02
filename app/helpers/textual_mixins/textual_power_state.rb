module TextualMixins::TextualPowerState
  def textual_power_state_whitelisted(state)
    state = state.blank? ? 'unknown' : state.downcase
    quad_icon = QuadiconHelper.machine_state(state)

    {
      :label      => _('Power State'),
      :value      => state,
      :icon       => quad_icon[:fonticon],
      :background => quad_icon[:background]
    }
  end

  def textual_power_state_whitelisted_with_template
    textual_power_state_whitelisted(@record.normalized_state)
  end
end
