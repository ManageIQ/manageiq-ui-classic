export const sampleReponse = {
    attributes: [
        "availability_zone_id",
        "chain_id",
        "container_group_id",
        "container_group_name",
        "container_id",
        "container_name",
        "container_namespace",
        "container_node_id",
        "container_node_name",
        "container_replicator_id",
        "container_replicator_name",
        "created_on",
        "dest_ems_cluster_id",
        "dest_ems_cluster_name",
        "dest_ems_cluster_uid",
        "dest_host_id",
        "dest_host_name",
        "dest_vm_ems_ref",
        "dest_vm_location",
        "dest_vm_name",
        "dest_vm_or_template_id",
        "ems_cluster_id",
        "ems_cluster_name",
        "ems_cluster_uid",
        "ems_id",
        "ems_ref",
        "event_type",
        "full_data",
        "generating_ems_id",
        "group_id",
        "host_id",
        "host_name",
        "id",
        "is_task",
        "message",
        "physical_chassis_id",
        "physical_server_id",
        "physical_storage_id",
        "physical_storage_name",
        "physical_switch_id",
        "source",
        "target_id",
        "target_type",
        "tenant_id",
        "timestamp",
        "type",
        "user_id",
        "username",
        "vm_ems_ref",
        "vm_location",
        "vm_name",
        "vm_or_template_id"
    ],
    virtual_attributes: [
        "group",
        "group_level",
        "group_name",
        "href_slug",
        "region_description",
        "region_number"
    ],
    relationships: [
        "availability_zone",
        "container_group",
        "container_node",
        "container_replicator",
        "dest_host",
        "dest_miq_template",
        "dest_vm",
        "dest_vm_or_template",
        "ext_management_system",
        "generating_ems",
        "host",
        "miq_template",
        "physical_chassis",
        "physical_server",
        "physical_storage",
        "physical_switch",
        "service",
        "target",
        "vm",
        "vm_or_template"
    ],
    subcollections: [],
    data: {
        timeline_events: {
            EmsEvent: {
                description: "Management Events",
                group_names: {
                    other: "Other",
                    addition: "Creation/Addition",
                    configuration: "Configuration/Reconfiguration",
                },
                group_levels: {
                    critical: "Critical",
                    detail: "Detail",
                    warning: "Warning"
                }
            },
            MiqEvent: {
                description: "Policy Events",
                group_names: {
                    other: "Other",
                    ems_operations: "Provider Operation",
                    host_operations: "Host Operation",
                },
                group_levels: {
                    success: "Success",
                    failure: "Failure",
                    detail: "Detail"
                }
            }
        }
    }
}

export const sampleSubmitPressedValues = {
    timeline_events: "EmsEvent",
    management_group_names: [
        "other",
        "addition"
    ],
    management_group_levels: [
        "critical",
        "detail"
    ],
    startDate: [
        "2022-09-07T04:00:00.000Z"
    ],
    endDate: [
        "2022-09-28T04:00:00.000Z"
    ]
}
