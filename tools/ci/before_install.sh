set -e

bin/setup

if [ "$TEST_SUITE" = "spec:javascript" ]; then
  source tools/ci/setup_js_env.sh
fi

set +v
