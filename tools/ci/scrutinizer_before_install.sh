set -e

sudo apt-get -y install cmake
git clone https://github.com/manageiq/manageiq.git spec/manageiq
cp tools/ci/database-scrutinizer.yml spec/manageiq/config/database.yml

cd spec/manageiq
export SKIP_DATABASE_SETUP=true
export SKIP_TEST_RESET=true
bin/setup
psql -c "CREATE DATABASE vmdb_test WITH OWNER = scrutinizer ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' TEMPLATE template0"
./bin/rake db:migrate db:seed test:vmdb:setup
cd -

source tools/ci/setup_js_env.sh

set +v
