gem uninstall -v '>= 2' -i $(rvm gemdir)@global -ax bundler || true
gem install bundler -v '2.2.9'
if [ "$TEST_SUITE" = "spec:javascript" -o "$TEST_SUITE" = "spec:jest" -o "$TEST_SUITE" = "spec:compile" ]; then
  # Check if `nvm` is available as a command or bash function
  type nvm >/dev/null 2>&1
  if [ $? -ne 0 ]; then . ~/.nvm/nvm.sh; fi

  nvm install 12
fi
