set -e

git clone https://github.com/ManageIQ/manageiq.git --depth 1 spec/manageiq
echo 'gem "manageiq-ui-classic", :path => "'$(/bin/pwd)'"' >> spec/manageiq/Gemfile.dev.rb

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
