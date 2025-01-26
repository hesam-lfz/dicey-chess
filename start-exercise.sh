#! /bin/sh
if [ "$#" -eq 0 ]; then
  echo "Error: No exercise name specified." 1>&2
  exit 1
fi

exercise_name="$1"

git switch main
git pull origin main
git branch $exercise_name
git branch --list
git switch $exercise_name
