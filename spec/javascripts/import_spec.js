describe('import.js', function() {
  describe('ImportSetup', function() {
    describe('#respondToPostMessages', function() {
      beforeEach(function() {
        spyOn(Automate, 'getAndRenderAutomateJson');
        spyOn(window, 'miqSparkleOff');
        spyOn(window, 'clearFlash');
        spyOn(window, 'add_flash');
      });

      context('when the import file upload id exists', function() {
        beforeEach(function() {
          var event = {
            data: {
              import_file_upload_id: 123,
              message: 'the message',
            },
          };

          ImportSetup.respondToPostMessages(event);
        });

        it('turns the sparkle off', function() {
          expect(window.miqSparkleOff).toHaveBeenCalled();
        });

        it('clears the messages', function() {
          expect(window.clearFlash).toHaveBeenCalled();
        });

        it('triggers the callback', function() {
          expect(Automate.getAndRenderAutomateJson).toHaveBeenCalledWith(123, 'the message');
        });
      });

      context('when the import file upload id does not exist', function() {
        var event = {data: {import_file_upload_id: ''}};

        context('when the message level is warning', function() {
          beforeEach(function() {
            event.data.message = {
              level: 'warning',
              message: 'lol',
            };
            ImportSetup.respondToPostMessages(event);
          });

          it('turns the sparkle off', function() {
            expect(window.miqSparkleOff).toHaveBeenCalled();
          });

          it('clears the messages', function() {
            expect(window.clearFlash).toHaveBeenCalled();
          });

          it('displays a warning message with the message', function() {
            expect(window.add_flash).toHaveBeenCalledWith('lol', 'warning');
          });
        });

        context('when the message level is not warning', function() {
          beforeEach(function() {
            event.data.message = {
              message: 'lol',
              level: 'error',
            };
            ImportSetup.respondToPostMessages(event);
          });

          it('turns the sparkle off', function() {
            expect(window.miqSparkleOff).toHaveBeenCalled();
          });

          it('clears the messages', function() {
            expect(window.clearFlash).toHaveBeenCalled();
          });

          it('displays an error message with the message', function() {
            expect(window.add_flash).toHaveBeenCalledWith('lol2', 'error');
          });
        });
      });
    });

    describe('#listenForGitPostMessages', function() {
      describe('post message callback', function() {
        beforeEach(function() {
          spyOn(window, 'miqSparkleOff');
        });

        context('when the message data level is an error', function() {
          var event = {};

          beforeEach(function() {
            spyOn(window, 'add_flash');
            spyOn($.fn, 'prop');
            event.data = {
              message: {
                level: 'error',
                message: 'test',
              }
            };
            ImportSetup.respondToGitPostMessages(event);
          });

          it('shows the error message', function() {
            expect(window.add_flash).toHaveBeenCalledWith('test', 'error');
          });

          it('disables the git-url-import', function() {
            expect($.fn.prop).toHaveBeenCalledWith('disabled', null);
            expect($.fn.prop.calls.mostRecent().object.selector).toEqual('#git-url-import');
          });

          it('turns the spinner off', function() {
            expect(window.miqSparkleOff).toHaveBeenCalled();
          });
        });

        context('when the message data level is not error', function() {
          var event = {};

          beforeEach(function() {
            spyOn(Automate, 'renderGitImport');
            event.data = {
              git_repo_id: 123,
              level: 'success',
              message: 'test',
            };
          });

          context('when the data has branches', function() {
            beforeEach(function() {
              event.data.git_branches = 'branches';
              ImportSetup.respondToGitPostMessages(event);
            });

            it('calls renderGitImport with the branches, tags, repo_id, and message', function() {
              expect(Automate.renderGitImport).toHaveBeenCalledWith('branches', undefined, 123, event.data.message);
            });

            it('turns the spinner off', function() {
              expect(window.miqSparkleOff).toHaveBeenCalled();
            });
          });

          context('when the data has tags with no branches', function() {
            beforeEach(function() {
              event.data.git_tags = 'tags';
              ImportSetup.respondToGitPostMessages(event);
            });

            it('calls renderGitImport with the branches, tags, repo_id, and message', function() {
              expect(Automate.renderGitImport).toHaveBeenCalledWith(undefined, 'tags', 123, event.data.message);
            });

            it('turns the spinner off', function() {
              expect(window.miqSparkleOff).toHaveBeenCalled();
            });
          });

          context('when the data has neither tags nor branches', function() {
            beforeEach(function() {
              ImportSetup.respondToGitPostMessages(event);
            });

            it('does not call renderGitImport', function() {
              expect(Automate.renderGitImport).not.toHaveBeenCalled();
            });

            it('turns the spinner off', function() {
              expect(window.miqSparkleOff).toHaveBeenCalled();
            });
          });
        });
      });
    });

    describe('SettingUpImportButton', function() {
      beforeEach(function() {
        var html = '';
        html += '<div class="col-md-6">'
        html += ' <input id="upload_button" />';
        html += '</div>';
        html += '<div>';
        html += ' <input id="upload_file" />';
        html += '</div>';

        setFixtures(html);
      });

      it('make upload button to not be disabled', function(){
        $('#upload_button').prop('disabled', true);
        $('#upload_file').prop('value', 'test_value');
        ImportSetup.setUpUploadImportButton('#upload_button');
        expect($('#upload_button').prop('disabled')).toEqual(false);
      });

      it('make upload button to be disabled', function(){
        $('#upload_button').prop('disabled', false);
        ImportSetup.setUpUploadImportButton('#upload_button');
        expect($('#upload_button').prop('disabled')).toEqual(true);
      });
    });
  });
});
