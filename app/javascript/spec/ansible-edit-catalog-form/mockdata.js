export const initalDataForFirstTestCase = {
    "catalogFormId": "148",
    "allCatalogs": [
        [
            "My Company/Playbooks as a Service",
            3
        ],
    ],
    "zones": [
        [
            "Amazon Zone",
            3
        ],
    ],
    "currentRegion": 0,
    "tenantTree": {
        "additional_tenants": [],
        "selectable": true,
        "ansible_playbook": true,
        "catalog_bundle": false,
        "locals_for_render": {
            "tree_id": "tenants_treebox",
            "tree_name": "tenants_tree",
            "bs_tree": "[]",
            "checkboxes": true,
            "hierarchical_check": true,
            "oncheck": "miqOnCheckTenantTree",
            "check_url": "/catalog/atomic_form_field_changed/"
        },
        "name": "tenants_tree",
        "options": {
            "checkboxes": true,
            "check_url": "/catalog/atomic_form_field_changed/",
            "open_all": false,
            "oncheck": "miqOnCheckTenantTree",
            "post_check": true,
            "three_checks": true
        },
        "tree_nodes": [
        ],
        "opened_nodes": [],
        "bs_tree": "[]"
    },
    "roleAllows": true
}

export const mockServiceTemplateResponseForFirstTestCase = {
    "href": "http://localhost:3001/api/service_templates/148",
    "id": "148",
    "name": "hh",
    "description": "hhhk",
    "guid": "a0e0f212-7313-45d8-b9c4-44d6c4c6dacd",
    "type": "ServiceTemplateAnsiblePlaybook",
    "service_template_id": null,
    "created_at": "2023-04-18T11:05:04Z",
    "updated_at": "2023-04-26T11:26:04Z",
    "display": true,
    "evm_owner_id": null,
    "miq_group_id": "2",
    "service_type": "atomic",
    "prov_type": "generic_ansible_playbook",
    "provision_cost": null,
    "service_template_catalog_id": "3",
    "long_description": "123",
    "tenant_id": "1",
    "generic_subtype": null,
    "deleted_on": null,
    "internal": false,
    "zone_id": "3",
    "currency_id": "40",
    "price": 1224,
    "config_info": {
        "provision": {
            "repository_id": "18",
            "playbook_id": "168",
            "credential_id": "10",
            "cloud_type": "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential",
            "cloud_credential_id": "151",
            "execution_ttl": "",
            "log_output": "on_error",
            "verbosity": "0",
            "extra_vars": {},
            "dialog_id": "6",
            "hosts": "localhost",
            "fqname": "/Service/Generic/StateMachines/GenericLifecycle/provision"
        },
        "retirement": {
            "repository_id": "18",
            "playbook_id": "168",
            "credential_id": "10",
            "cloud_type": "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential",
            "cloud_credential_id": "151",
            "execution_ttl": "",
            "log_output": "on_error",
            "verbosity": "0",
            "remove_resources": "no_with_playbook",
            "extra_vars": {},
            "hosts": "localhost",
            "fqname": "/Service/Generic/StateMachines/GenericLifecycle/Retire_Advanced_Resource_None"
        }
    },
}

export const mockServiceTemplateResponseForSecondTestCase = {
    "href": "http://localhost:3001/api/service_templates/148",
    "id": "148",
    "name": "hh",
    "description": "hhhk",
    "guid": "a0e0f212-7313-45d8-b9c4-44d6c4c6dacd",
    "type": "ServiceTemplateAnsiblePlaybook",
    "service_template_id": null,
    "created_at": "2023-04-18T11:05:04Z",
    "updated_at": "2023-04-26T11:26:04Z",
    "display": true,
    "evm_owner_id": null,
    "miq_group_id": "2",
    "service_type": "atomic",
    "prov_type": "generic_ansible_playbook",
    "provision_cost": null,
    "service_template_catalog_id": "3",
    "long_description": "123",
    "tenant_id": "1",
    "generic_subtype": null,
    "deleted_on": null,
    "internal": false,
    "zone_id": "3",
    "currency_id": "40",
    "price": 1224,
    "config_info": {
        "provision": {
            "repository_id": "18",
            "playbook_id": "168",
            "credential_id": "10",
            "cloud_type": "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential",
            "cloud_credential_id": "151",
            "execution_ttl": "",
            "log_output": "on_error",
            "verbosity": "0",
            "extra_vars": {},
            "dialog_id": "6",
            "hosts": "localhost",
            "fqname": "/Service/Generic/StateMachines/GenericLifecycle/provision"
        },
        "retirement": {
            "execution_ttl": "",
            "log_output": "on_error",
            "verbosity": "0",
            "remove_resources": "no_with_playbook",
            "extra_vars": {},
            "hosts": "localhost",
            "fqname": "/Service/Generic/StateMachines/GenericLifecycle/Retire_Advanced_Resource_None"
        }
    },
}

export const currenciesmockData = {
    "name": "currencies",
    "count": 166,
    "subcount": 166,
    "pages": 1,
    "resources": [
        {
            "href": "http://localhost:3001/api/currencies/164",
            "id": "40",
            "full_name": "Zambian Kwacha",
            "symbol": "K",
            "code": "ZMW"
        }
    ],
}

export const repositoriesMockData = {
    "name": "configuration_script_sources",
    "count": 13,
    "subcount": 13,
    "subquery_count": 13,
    "pages": 1,
    "resources": [
        {
            "href": "http://localhost:3001/api/configuration_script_sources/18",
            "id": "18",
            "name": "test_Essentials"
        },
    ],
}

export const MachineCredentialMockData = {
    "name": "authentications",
    "count": 5,
    "subcount": 5,
    "pages": 1,
    "resources": [
        {
            "href": "http://localhost:3001/api/authentications/173",
            "id": "10",
            "name": "ManageIQ Default Credential",
            "options": null
        },
    ],
}

export const VaultCredentialMockData = {
    "name": "authentications",
    "count": 0,
    "subcount": 0,
    "pages": 0,
    "resources": [],
}

export const CloudTypesMockData = {
    "subcollections": [],
    "data": {
        "credential_types": {
            "embedded_ansible_credential_types": {
                "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential": {
                    "type": "cloud",
                    "label": "OpenStack",
                },
            }
        }
    }
}

export const zonesMockData = {
    "name": "zones",
    "count": 17,
    "subcount": 17,
    "pages": 1,
    "resources": [
        {
            "href": "http://localhost:3001/api/zones/3",
            "id": "3",
            "description": "Amazon Zone",
            "visible": true
        },
    ],
}

export const availableCatalogMockData = {
    "name": "service_catalogs",
    "count": 20,
    "subcount": 20,
    "pages": 1,
    "resources": [
        {
            "href": "http://localhost:3001/api/service_catalogs/3",
            "id": "3",
            "name": "Playbooks as a Service"
        },
    ],
}

export const availableDialogMockData = {
    "name": "service_dialogs",
    "count": 86,
    "subcount": 86,
    "pages": 1,
    "resources": [
        {
            "href": "http://localhost:3001/api/service_dialogs/6",
            "id": "6",
            "label": " dancer-mysql-example Dialog"
        },
    ],
}

export const getSpecificCloudTypeMockData = {
    "href": "http://localhost:3001/api/authentications/151",
    "id": "151",
    "name": "OpenStack - SouthEast Cloud Admin",
}

export const playBookOptionsMockData = {
    "resources" : [
        {
            "href": "http://localhost:3001/api/configuration_script_sources/18/configuration_script_payloads/168",
            "id": "168",
            "manager_id": "2",
            "manager_ref": "ansible/amazon/ec2_basic.yml",
            "name": "ansible/amazon/ec2_basic.yml",
            "description": null,
            "variables": null,
            "created_at": "2017-11-17T20:56:07Z",
            "updated_at": "2017-11-17T20:56:07Z",
            "survey_spec": null,
            "inventory_root_group_id": null,
            "type": "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook",
            "parent_id": null,
            "configuration_script_source_id": "18"
        },
    ]
}

export const cloudCredentailOptions = {
    "resources" : [
        {
            "href": "http://localhost:3001/api/authentications/151",
            "id": "151",
            "name": "OpenStack - SouthEast Cloud Admin"
        }
    ]
}