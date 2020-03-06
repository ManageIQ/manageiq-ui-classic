# not spec, and not cross repo
if [ "$TEST_SUITE" = "spec:javascript" -o "$TEST_SUITE" = "spec:jest" -o "$TEST_SUITE" = "spec:compile" ]; then
  nvm install 10
fi

bin/setup

source tools/ci/setup_js_env.sh

RAILS_ENV=test bundle exec rake db:seed

set +v
