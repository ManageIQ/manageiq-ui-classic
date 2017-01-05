set -e

git clone https://github.com/karelhala/manageiq.git --branch report_data --depth 1 spec/manageiq

cd spec/manageiq
source tools/ci/setup_vmdb_configs.sh
cd -

source tools/ci/setup_js_env.sh

# HACK: Temporary workaround until we can get the cross-repo scripts working properly
# source spec/manageiq/tools/ci/setup_ruby_env.sh
spec/manageiq/tools/ci/setup_ruby_environment.rb

set +v
