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

OLD=`mktemp`
NEW=`mktemp`

echo "Debride run"
bundle exec debride --version
bundle exec debride --rails app/controllers/ | cut -d ":" -f1 > "$NEW"
echo "Debride done new"

git checkout  master

# remove once it's merged
gem install debride

debride --rails app/controllers/ | cut -d ":" -f1 > "$OLD"
echo "Debride done old"


echo "New possibly dead methods"

diff -Naur "$OLD" "$NEW"

