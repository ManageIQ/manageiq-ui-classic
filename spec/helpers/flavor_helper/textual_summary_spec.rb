describe FlavorHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[
    cpus
    cpu_sockets
    memory
    enabled
    publicly_available
    supports_32_bit
    supports_64_bit
    supports_hvm
    supports_paravirtual
    block_storage_based_only
    cloud_subnet_required
  ]

  include_examples "textual_group", "Relationships", %i[ems_cloud instances]
end
