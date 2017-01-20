class CimStorageExtentController < CimInstanceController
  def button
    process_button
  end

  def show
    process_show(
      'snia_local_file_systems' => :local_file_systems,
      'vms'                     => :vms,
      'hosts'                   => :hosts,
      'storages'                => :storages
    )
  end
end
