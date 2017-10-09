module TextualMixins::TextualAvailability
  STATUS_TRANSLATIONS = {
    'enabled'  => N_('Enabled'),
    'disabled' => N_('Disabled'),
    'running'  => N_('Running'),
    'up'       => N_('Running'),
    'stopped'  => N_('Stopped'),
    'down'     => N_('Stopped'),
    'unknown'  => N_('Unknown')
  }.freeze

  def translated_status(status)
    status ||= 'unknown'
    STATUS_TRANSLATIONS.key?(status.downcase) ? _(STATUS_TRANSLATIONS[status.downcase]) : status
  end
end
