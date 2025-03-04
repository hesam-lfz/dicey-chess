-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

insert into "users" ("userId", "username", "hashedPassword")
values (1, 'autodidact', '$argon2i$v=19$m=4096,t=3,p=1$h7icQD/xZr8akZsX+hNA0A$h68atJWyjvunAwNOpSpMfg9sPvoMQ6dKwoh0dJhurWA'),
       (2, 'admin', '$argon2i$v=19$m=4096,t=3,p=1$h7icQD/xZr8akZsX+hNA0A$h68atJWyjvunAwNOpSpMfg9sPvoMQ6dKwoh0dJhurWA');

-- EXAMPLE:

--  insert into "todos"
--    ("userId", "task", "isCompleted")
--    values
--      (1, 'Learn to code', false),
--      (1, 'Build projects', false),
--      (2, 'Get a job', false);
