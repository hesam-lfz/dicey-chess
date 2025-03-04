set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

create table "public"."users" (
  "userId"         serial,
  "username"       text not null,
  "hashedPassword" text not null,
  "createdAt"      timestamptz(6) not null default now(),
  primary key ("userId"),
  unique ("username")
);

create table "public"."games" (
  "at"      integer        not null,
  "userId"      integer        not null,
  "duration"      integer        not null,
  "outcome"        text           not null,
  "moveHistory"        text           not null,
  "diceRollHistory"        text           not null,
  "humanPlaysWhite"        boolean           not null,
  primary key ("at", "userId")
);
