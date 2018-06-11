module TextualMixins::TextualPowerState
  VALID_POWER_STATE = %w(
    archived connecting disconnected image_locked install_failed maintenance
    migrating never non_operational not_responding off on orphaned paused
    powering_down powering-down powering_up powering-up preparing_for_maintenance
    reboot_in_progress retired shelved_offloaded shelved standby suspended
    template terminated unknown wait_for_launch
  ).freeze

  def power_state_to_image(state)
    "svg/currentstate-#{state}.svg" if VALID_POWER_STATE.include?(state)
  end

  def textual_power_state_whitelisted(state)
    state = state.blank? ? 'unknown' : state.downcase
    {:label => _('Power State'), :value => state, :image => power_state_to_image(state)}
  end

  def textual_power_state_whitelisted_with_template
    textual_power_state_whitelisted(@record.template? ? 'template' : @record.current_state)
  end
end
