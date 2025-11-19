{
    "States": {
        "VMware Template ": {
            "Type": "Task",
            "Resource": "docker://docker.io/manageiq/workflows-examples-provision-vm-service-list-templates:latest",
            "Credentials": {
                "api_user.$": "$.api_user",
                "api_password.$": "$.api_password",
                "api_token.$": "$.api_token",
                "api_bearer_token.$": "$.api_bearer_token"
            },
            "Parameters": {
                "API_URL.$": "$$.Execution._manageiq_api_url",
                "VERIFY_SSL.$": "$.dialog.dialog_verify_ssl",
                "PROVIDER_ID.$": "$.dialog.dialog_provider"
            },
            "Next": "Choice"
        },
        "Choice": {
            "Type": "Choice",
            "Choices": [
                {
                    "Next": "Wait (2)"
                }
            ],
            "Default": "providers"
        },
        "Wait (2)": {
            "Type": "Wait",
            "Seconds": 5,
            "Next": "Pass"
        },
        "Pass": {
            "Type": "Pass",
            "Next": "Wait (1)"
        },
        "Wait (1)": {
            "Type": "Wait",
            "Seconds": 5,
            "Next": "Send Email "
        },
        "Send Email ": {
            "Type": "Task",
            "Resource": "manageiq://email",
            "Parameters": {
                "To": "user@example.com",
                "Subject": "Your provisioning has completed",
                "Body": "Your provisioning request has completed"
            },
            "Next": "Success"
        },
        "Success": {
            "Type": "Succeed",
            "Comment": "tttt"
        },
        "Wait": {
            "Type": "Wait",
            "Seconds": 11,
            "Next": "Wait (3)"
        },
        "Wait (3)": {
            "Type": "Wait",
            "Seconds": 5,
            "Next": "ECS RunTask"
        },
        "ECS RunTask": {
            "Type": "Task",
            "Resource": "arn:aws:states:::ecs:runTask",
            "Parameters": {
                "LaunchType": "FARGATE",
                "Cluster": "arn:aws:ecs:REGION:ACCOUNT_ID:cluster/MyECSCluster",
                "TaskDefinition": "arn:aws:ecs:REGION:ACCOUNT_ID:task-definition/MyTaskDefinition:1"
            },
            "Next": "Wait (4)"
        },
        "Wait (4)": {
            "Type": "Wait",
            "Seconds": 5,
            "End": true
        },
        "providers": {
            "Type": "Task",
            "Resource": "docker://docker.io/manageiq/workflows-examples-provision-vm-service-list-providers:latest",
            "Credentials": {
                "api_user.$": "$.api_user",
                "api_password.$": "$.api_password",
                "api_token.$": "$.api_token",
                "api_bearer_token.$": "$.api_bearer_token"
            },
            "Parameters": {
                "API_URL.$": "$$.Execution._manageiq_api_url",
                "VERIFY_SSL.$": "$.dialog.dialog_verify_ssl",
                "PROVIDER_TYPE": "ManageIQ::Providers::Vmware::InfraManager"
            },
            "Next": "VMware Template2"
        },
        "VMware Template2": {
            "Type": "Task",
            "Resource": "docker://docker.io/manageiq/workflows-examples-provision-vm-service-list-templates:latest",
            "Credentials": {
                "api_user.$": "$.api_user",
                "api_password.$": "$.api_password",
                "api_token.$": "$.api_token",
                "api_bearer_token.$": "$.api_bearer_token"
            },
            "Parameters": {
                "API_URL.$": "$$.Execution._manageiq_api_url",
                "VERIFY_SSL.$": "$.dialog.dialog_verify_ssl",
                "PROVIDER_ID.$": "$.dialog.dialog_provider"
            },
            "Next": "Fail"
        },
        "Fail": {
            "Type": "Fail",
            "End": true,
            "Error": "test error",
            "Cause": "caused by stattes",
            "Comment": "comment"
        }
    },
    "Comment": "A simple minimal example of the States language",
    "StartAt": "VMware Template "
}