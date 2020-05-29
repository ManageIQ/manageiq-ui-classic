# not spec, and not cross repo
if [ "$TEST_SUITE" = "spec:javascript" -o "$TEST_SUITE" = "spec:jest" -o "$TEST_SUITE" = "spec:compile" -o "$TEST_SUITE" = "spec:integration" ]; then
  nvm install 10
fi

if [ "$TEST_SUITE" = "spec:integration" ]; then
  # Ensure development mode for database creation, migration, and rails server
  export RAILS_ENV="development"

  # dev mode assumes memcache store in session_store.rb, so we need to explicitly ask for memory store in dev mode
  # Note: test mode defaults to memory store in session_store.rb so we're following that example.
  export RAILS_USE_MEMORY_STORE="true"
fi
