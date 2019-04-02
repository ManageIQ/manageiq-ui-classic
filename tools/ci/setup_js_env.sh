# make sure yarn is installed, in the right version
bundle exec rake webpacker:check_yarn || npm install -g yarn

# install & compile dependencies
bundle exec rake update:ui
