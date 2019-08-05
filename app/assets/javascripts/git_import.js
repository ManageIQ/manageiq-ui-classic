/* global miqSparkleOn miqSparkleOff showErrorMessage clearMessages */

var GitImport = {
  TASK_POLL_TIMEOUT: 1500,

  retrieveDatastoreClickHandler: function() {
    $('.git-retrieve-datastore').click(function(event) {
      event.preventDefault();
      miqSparkleOn();
      clearMessages();

      $.post('retrieve_git_datastore', $('#retrieve-git-datastore-form').serialize(), function(data) {
        var messages = data.message;
        if (messages && messages.level === 'error') {
          showErrorMessage(messages.message);
          miqSparkleOff();
        } else {
          GitImport.pollForGitTaskCompletion(data);
        }
      });
    });
  },

  pollForGitTaskCompletion: function(gitData) {
    $.get('check_git_task', gitData, function(data) {
      if (data.state) {
        setTimeout(GitImport.pollForGitTaskCompletion, GitImport.TASK_POLL_TIMEOUT, gitData);
      } else {
        GitImport.gitTaskCompleted(data);
      }
    });
  },

  gitTaskCompleted: function(data) {
    if (data.success) {
      var postMessageData = {
        git_repo_id: data.git_repo_id,
        git_branches: data.git_branches,
        git_tags: data.git_tags,
        message: data.message,
      };

      parent.postMessage(postMessageData, '*');
    } else {
      parent.postMessage({message: data.message}, '*');
    }
  },
};
