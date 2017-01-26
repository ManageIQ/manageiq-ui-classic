if [ "$TEST_SUITE" = "spec" ]; then
  bundle exec codeclimate-test-reporter;
fi

cat Gemfile.lock
