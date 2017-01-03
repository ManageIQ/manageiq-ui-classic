set -e

# The bower cache already exists under spec/manageiq/vendor/assets/bower_components
# and unfortunately it is not possible to git clone to a non-empty directory.
mkdir -p spec/manageiq
cd spec/manageiq
git init
git remote add origin https://github.com/ManageIQ/manageiq.git
git pull origin master --depth=1
cd -

cd spec/manageiq
source tools/ci/setup_vmdb_configs.sh
source tools/ci/setup_js_env.sh
cd -

# HACK: Temporary workaround until we can get the cross-repo scripts working properly
# source spec/manageiq/tools/ci/setup_ruby_env.sh
spec/manageiq/tools/ci/setup_ruby_environment.rb
export BUNDLE_WITHOUT=development
export BUNDLE_GEMFILE=${PWD}/Gemfile

set +v
