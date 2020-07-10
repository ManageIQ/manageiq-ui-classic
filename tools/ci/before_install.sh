set -e

if [ "$TEST_SUITE" != "spec" ]; then
  nvm install 12
fi

bin/setup

source tools/ci/setup_js_env.sh

set +v
