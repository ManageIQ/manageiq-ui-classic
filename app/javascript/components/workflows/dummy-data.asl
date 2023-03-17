{
  "Comment": "An example of the Amazon States Language using a choice state.",
  "StartAt": "FirstState",
  "States": {
    "FirstState": {
      "Type": "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "Retry": [
        {
          "ErrorEquals": [ "States.Timeout" ],
          "IntervalSeconds": 3,
          "MaxAttempts": 2,
          "BackoffRate": 1.5
        }
      ],
      "Catch": [
        {
          "ErrorEquals": [ "States.ALL" ],
          "Next": "FailState"
        }
      ],
      "Next": "ChoiceState"
    },

    "ChoiceState": {
      "Type" : "Choice",
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
        }
      ],
      "Default": "FailState"
    },

    "FirstMatchState": {
      "Type" : "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "Next": "PassState"
    },

    "SecondMatchState": {
      "Type" : "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "Next": "NextState"
    },

    "PassState": {
      "Type": "Pass",
      "Result": {
        "foo": "bar",
        "bar": "baz"
      },
      "ResultPath": "$.result",
      "Next": "NextState"
    },

    "FailState": {
      "Type": "Fail",
      "Error": "FailStateError",
      "Cause": "No Matches!"
    },

    "SuccessState": {
      "Type": "Succeed"
    },

    "NextState": {
      "Type": "Task",
      "Resource": "docker://agrare/hello-world:latest",
      "End": true
    }
  }
}
