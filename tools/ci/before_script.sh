# not spec, and not cross repo
if [ "$TEST_SUITE" = "spec:javascript" -o "$TEST_SUITE" = "spec:jest" -o "$TEST_SUITE" = "spec:compile" -o "$TEST_SUITE" = "spec:integration" ]; then
  # make sure yarn is installed, in the right version
  bundle exec rake webpacker:check_yarn || npm install -g yarn

  # install & compile dependencies
  bundle exec rake update:ui
fi

if [ "$TEST_SUITE" = "spec:integration" ]; then
  pushd spec/manageiq

  # Hack:  bin/setup will not honor RAILS_ENV.  It only creates/migrates/seeds the test database, so we need to do this again with the dev db.
  bundle exec rake db:create db:migrate db:seed
  bundle exec rails server > /dev/null & wait-on http://localhost:3000
  popd
fi
