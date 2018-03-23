which bower || npm install -g bower

# Clean up old bower_components location
if [ -d vendor/assets/bower_components ]; then
  rm -rf vendor/assets/bower_components
fi

# Check if the bower cache is valid, otherwise delete it
if ! cmp --silent bower.json vendor/assets/bower/bower_components/bower.json; then
  rm -rf vendor/assets/bower/bower_components
fi

if [ -d vendor/assets/bower/bower_components ]; then
  # Using bower_components from cache
  echo "bower assets installed... moving on."
else
  bower install --allow-root -F --config.analytics=false
  STATUS=$?
  echo bower exit code: $STATUS

  # fail the whole test suite if bower install failed
  [ $STATUS = 0 ] || exit 1
  [ -d vendor/assets/bower/bower_components ] || exit 1
fi

# make sure yarn is installed, in the right version
bundle exec rake webpacker:check_yarn || npm install -g yarn

# install & compile dependencies
bundle exec rake update:ui
