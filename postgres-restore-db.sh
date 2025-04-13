#! /bin/sh
if [ "$#" -eq 0 ] || [ "$#" -eq 1 ] || [ "$#" -eq 2 ]; then
  echo "Error: No db name and/or schema.sql file path and/or data.sql file path specified." 1>&2
  exit 1
fi

# start in the `sql-mutations` directory
dropdb $1 # db name
createdb $1 # db name
psql -d $1 -f $2 #../postgres-database/schema.sql
psql -d $1 -f $3 #../postgres-database/data.sql
