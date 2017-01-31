class OntapStorageVolumeController < CimInstanceController
  def button
    process_button
  end

  def show
    process_show(
      'cim_base_storage_extents' => :base_storage_extents,
      'vms'                      => :vms,
      'hosts'                    => :hosts,
      'storages'                 => :storages
    )
  end

  private

  def textual_group_list
    [%i(properties tags), %i(relationships infrastructure_relationships)]
  end
  helper_method :textual_group_list

  menu_section :nap
end
