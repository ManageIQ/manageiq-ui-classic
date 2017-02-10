class OntapLogicalDiskController < CimInstanceController
  def button
    process_button
  end

  def show
    process_show(
      'cim_base_storage_extents' => :base_storage_extents,
      'ontap_file_share'         => :file_shares,
      'vms'                      => :vms,
      'hosts'                    => :hosts,
      'storages'                 => :storages
    )
  end

  private

  def textual_group_list
    [%i(properties relationships infrastructure_relationships), %i(capacity_data smart_management)]
  end
  helper_method :textual_group_list

  menu_section :nap
end
