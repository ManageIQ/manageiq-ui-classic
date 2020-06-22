# not spec, and not cross repo
if [ "$TEST_SUITE" = "spec:javascript" -o "$TEST_SUITE" = "spec:jest" -o "$TEST_SUITE" = "spec:compile" -o "$TEST_SUITE" = "spec:integration" ]; then
  nvm install 10
fi
