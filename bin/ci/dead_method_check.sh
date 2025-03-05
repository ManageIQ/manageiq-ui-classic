# Run only against PR that is based on master
if [ "$GITHUB_BASE_REF" = "master" ]; then
  OLD=`mktemp`
  NEW=`mktemp`

  bundle exec debride --rails app/controllers/ | cut -d ":" -f1 > "$NEW"

  git checkout  master -- app/

  bundle exec debride --rails app/controllers/ | cut -d ":" -f1 > "$OLD"

  echo -e "\n"
  echo "New possibly dead methods:"
  echo -e "\n"
  diff -Naur "$OLD" "$NEW" | grep '^+ '
  echo -e "\n"
fi
