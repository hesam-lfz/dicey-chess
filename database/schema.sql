set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

create table "public"."users" (
  "userId"         serial,
  "username"       text not null,
  "hashedPassword" text not null,
  "rank"      integer        not null,
  "createdAt"      timestamptz(6) not null default now(),
  primary key ("userId"),
  unique ("username")
);

create table "public"."savedGames" (
  "userId"      integer        not null,
  "at"      integer        not null,
  "duration"      integer        not null,
  "opponent"       text not null,
  "outcome"        integer           not null,
  "moveHistory"        text           not null,
  "diceRollHistory"        text           not null,
  "userPlaysWhite"        boolean           not null,
  primary key ("userId", "at")
);

create table "public"."onlineGames" (
  "userId"      integer        not null,
  "friendId"      integer        not null,
  "pending"        boolean           not null,
  "pin"       text not null,
  primary key ("userId")
);

alter table "savedGames" add constraint "user_saved_games" foreign key ("userId") references "users" ("userId");
alter table "onlineGames" add constraint "user_online_games" foreign key ("userId") references "users" ("userId");
