rm -rf vendor/assets/bower_components

# make sure yarn is installed, in the right version
bundle exec rake webpacker:check_yarn || npm install -g yarn

# install npm dependencies
yarn

# compile webpacker assets
bundle exec rake webpack:compile
