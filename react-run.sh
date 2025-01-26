#! /bin/sh
if [ "$#" -eq 0 ] || [ "$#" -eq 1 ]; then
  echo "Error: No exercise name and/or app name specified." 1>&2
  exit 1
fi

exercise_name="$1"
app_name="$2"

cd $exercise_name/$app_name;npm run dev
