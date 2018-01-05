set -e

psql -c "create user root with password 'smartvm' createdb"
sudo apt-get -y install cmake

export SKIP_DATABASE_SETUP=true
export SKIP_TEST_RESET=true
bin/setup
./bin/rake db:migrate db:seed test:vmdb:setup

source tools/ci/setup_js_env.sh

set +v
