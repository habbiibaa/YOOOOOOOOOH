create table if not exists sessions (
  id serial primary key,
  day text not null,
  court text not null,
  coach text not null,
  time text not null,
  player text not null,
  type text not null,
  booked boolean default false
); 