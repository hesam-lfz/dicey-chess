# start in the `sql-mutations` directory
dropdb $1 # db name
createdb $1 # db name
psql -d $1 -f $2 #../postgres-database/schema.sql
psql -d $1 -f $3 #../postgres-database/data.sql
