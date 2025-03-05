-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

insert into "users" ("userId", "username", "hashedPassword")
values (1, 'autodidact', '$argon2i$v=19$m=4096,t=3,p=1$h7icQD/xZr8akZsX+hNA0A$h68atJWyjvunAwNOpSpMfg9sPvoMQ6dKwoh0dJhurWA'),
       (2, 'admin', '$argon2i$v=19$m=4096,t=3,p=1$h7icQD/xZr8akZsX+hNA0A$h68atJWyjvunAwNOpSpMfg9sPvoMQ6dKwoh0dJhurWA');

-- EXAMPLE:

insert into "games"
   ("at", "userId", "duration", "outcome", "moveHistory", "diceRollHistory", "humanPlaysWhite")
    values
      (1741112992, 0, 32, 1, 'e3,Qf3,Bc4,Qf4,Qf6,e5,Ne7,h6,Qf5,Qxf7#', '3,0,2,3,2', true);
