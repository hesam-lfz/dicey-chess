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
--- [{"at":1741112992,"userId":0,"duration":32,"outcome":1,"moveHistory":"e3,Qf3,Bc4,Qf4,Qf6,e5,Ne7,h6,Qf5,Qxf7#","diceRollHistory":"3,0,2,3,2","humanPlaysWhite":true}]
