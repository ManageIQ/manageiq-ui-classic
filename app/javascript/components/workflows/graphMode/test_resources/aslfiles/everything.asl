{
    "Comment": "An example of the Amazon States Language with all states.",
    "StartAt": "FirstState",
    "States": {
        "FirstState": {
            "Type": "Task",
            "Resource": "docker://docker.io/agrare/hello-world:latest",
            "Credentials": {
                "mysecret": "dont tell anyone"
            },
            "Retry": [
                {
                    "ErrorEquals": [
                        "States.Timeout"
                    ],
                    "IntervalSeconds": 3,
                    "MaxAttempts": 2,
                    "BackoffRate": 1.5
                }
            ],
            "Catch": [
                {
                    "ErrorEquals": [
                        "States.ALL"
                    ],
                    "Next": "FailState"
                }
            ],
            "Next": "ChoiceState"
        },
        "ChoiceState": {
            "Type": "Choice",
            "Choices": [
                {
                    "Variable": "$.foo",
                    "NumericEquals": 1,
                    "Next": "FirstMatchState"
                },
                {
                    "Variable": "$.foo",
                    "NumericEquals": 2,
                    "Next": "SecondMatchState"
                },
                {
                    "Variable": "$.foo",
                    "NumericEquals": 3,
                    "Next": "SuccessState"
                },
                {
                    "Variable": "$.foo",
                    "StringEquals": "b",
                    "Next": "ChoiceState"
                }
            ],
            "Default": "FailState"
        },
        "FirstMatchState": {
            "Type": "Task",
            "Resource": "docker://docker.io/agrare/hello-world:latest",
            "Next": "PassState"
        },
        "SecondMatchState": {
            "Type": "Task",
            "Resource": "docker://docker.io/agrare/hello-world:latest",
            "Next": "WaitState"
        },
        "WaitState": {
            "Type": "Wait",
            "Seconds": 1,
            "Next": "PassState"
        },
        "PassState": {
            "Type": "Pass",
            "Next": "MapState",
            "Result": {
                "foo": "bar",
                "colors": [
                    "red",
                    "green",
                    "blue",
                    "yellow",
                    "white"
                ]
            }
        },
        "FailState": {
            "Type": "Fail",
            "Error": "FailStateError",
            "Cause": "No Matches!"
        },
        "MapState": {
            "Type": "Map",
            "ItemsPath": "$.colors",
            "MaxConcurrency": 2,
            "ItemProcessor": {
                "ProcessorConfig": {
                    "Mode": "INLINE"
                },
                "StartAt": "Generate UUID",
                "States": {
                    "Generate UUID": {
                        "Type": "Pass",
                        "Next": "PassState",
                        "Parameters": {
                            "uuid.$": "States.UUID()"
                        }
                    },
                    "PassState": {
                        "Type": "Pass",
                        "End": true
                    }
                }
            },
            "Next": "ParallelState"
        },
        "ParallelState": {
            "Type": "Parallel",
            "Next": "SuccessState",
            "Branches": [
                {
                    "StartAt": "Add",
                    "States": {
                        "Add": {
                            "Type": "Task",
                            "Resource": "docker://docker.io/agrare/sleep:latest",
                            "End": true
                        }
                    }
                },
                {
                    "StartAt": "Subtract",
                    "States": {
                        "Subtract": {
                            "Type": "Task",
                            "Resource": "docker://docker.io/agrare/sleep:latest",
                            "End": true
                        }
                    }
                }
            ]
        },
        "SuccessState": {
            "Type": "Succeed"
        }
    }
}