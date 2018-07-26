describe OpsHelper::TextualSummary do
  before do
    instance_variable_set(:@record, "")
  end

  include_examples "textual_group", "Properties", %i(
    vmdb_connection_name
    vmdb_connection_ipaddress
    vmdb_connection_vendor
    vmdb_connection_version
    vmdb_connection_data_directory
    vmdb_connection_data_disk
    vmdb_connection_last_start_time
  ), "vmdb_connection_properties"

  include_examples "textual_group", "Capacity Data", %i(
    vmdb_connection_timestamp
    vmdb_connection_total_space
    vmdb_connection_used_space
    vmdb_connection_free_space
    vmdb_connection_total_index_nodes
    vmdb_connection_used_index_nodes
    vmdb_connection_free_index_nodes
  ), "vmdb_connection_capacity_data"
end
