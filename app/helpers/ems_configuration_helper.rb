module EmsConfigurationHelper
  include_concern 'TextualSummary'

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_configuration_path : ems_configuration_path(ems)
  end
end
