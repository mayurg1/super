-- Foundational extensions. Reversible by dropping only when no dependent object remains.
create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;
create extension if not exists btree_gist;

