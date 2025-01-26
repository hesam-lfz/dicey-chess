#! /bin/sh
if [ "$#" -eq 0 ]; then
  echo "Error: No exercise name specified." 1>&2
  exit 1
fi

exercise_name="$1"

git switch $exercise_name
git status
git add $exercise_name
git status
git commit -a -m "Completed $exercise_name exercise."
git push origin $exercise_name
git switch main
