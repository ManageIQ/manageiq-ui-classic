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

if [ "$TEST_SUITE" = "spec"  && "$TRAVIS_PULL_REQUEST"]; then
  OLD=`mktemp`
  NEW=`mktemp`

  bundle exec debride --rails app/controllers/ | cut -d ":" -f1 > "$NEW"

  git checkout  master -- app/

  bundle exec debride --rails app/controllers/ | cut -d ":" -f1 > "$OLD"

  echo "New possibly dead methods"

  diff -Naur "$OLD" "$NEW"
fi

