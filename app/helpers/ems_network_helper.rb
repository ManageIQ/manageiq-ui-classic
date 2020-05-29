module EmsNetworkHelper
  include_concern 'TextualSummary'

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_networks_path : ems_network_path(ems)
  end
end
