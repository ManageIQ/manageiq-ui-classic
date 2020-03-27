# this is *not* used in cross-repo

(cd spec/manageiq ; git log -1 --oneline)

if [ "$TEST_SUITE" = "spec:compile" ]; then
  # Collapse Travis output https://github.com/travis-ci/travis-ci/issues/2158
  echo "travis_fold:start:GEMFILE_LOCK"
  bundle show
  echo "travis_fold:end:GEMFILE_LOCK"
fi

if [ "$TEST_SUITE" = "spec:javascript" ]; then
  echo "travis_fold:start:YARN_LOCK"
  yarn list
  echo "travis_fold:end:YARN_LOCK"
fi
