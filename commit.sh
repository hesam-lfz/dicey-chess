#! /bin/sh
if [ "$#" -eq 0 ]; then
  echo "Error: No commit message specified!" 1>&2
  exit 1
fi

message="$1"
git commit -a -m "$message"
