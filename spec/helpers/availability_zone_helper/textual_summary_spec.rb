describe AvailabilityZoneHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[ems_cloud instances cloud_volumes custom_button_events]
  include_examples "textual_group", "Totals for Availability Zone", %i[
    block_storage_disk_capacity
    block_storage_disk_usage
  ], "availability_zone_totals"
end
