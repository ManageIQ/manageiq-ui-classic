set -e

git clone https://github.com/ManageIQ/manageiq.git --branch master --depth 1 spec/manageiq
echo "XXXXX"
echo $TRAVIS_PULL_REQUEST_BRANCH
echo $TRAVIS_BRANCH
echo "XXXXX"
cd spec/manageiq
source tools/ci/setup_vmdb_configs.sh
cd -

source tools/ci/setup_js_env.sh

# HACK: Temporary workaround until we can get the cross-repo scripts working properly
# source spec/manageiq/tools/ci/setup_ruby_env.sh
spec/manageiq/tools/ci/setup_ruby_environment.rb

set +v
