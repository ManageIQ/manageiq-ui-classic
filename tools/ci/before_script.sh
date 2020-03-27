# not spec, and not cross repo
if [ "$TEST_SUITE" = "spec:javascript" -o "$TEST_SUITE" = "spec:jest" -o "$TEST_SUITE" = "spec:compile" ]; then
  # make sure yarn is installed, in the right version
  bundle exec rake webpacker:check_yarn || npm install -g yarn

  # install & compile dependencies
  bundle exec rake update:ui
fi
