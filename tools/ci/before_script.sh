# not spec, and not cross repo
if [ "$TEST_SUITE" = "spec:javascript" -o "$TEST_SUITE" = "spec:jest" -o "$TEST_SUITE" = "spec:compile" -o "$TEST_SUITE" = "spec:cypress" ]; then
  # make sure yarn is installed, in the right version
  bundle exec rake webpacker:check_yarn || npm install -g yarn

  # install & compile dependencies
  bundle exec rake update:ui

  if [ "$TEST_SUITE" = "spec:cypress" ]; then
    # run evm:compile_assets (and friends) if cypress
    bundle exec rake app:cypress:ui:seed
  fi
fi
