
alter table categories3 rename unlisted to unlist_category;
alter table categories3 add column unlist_topics boolean;

-- It's empty anyway
drop table tag_notf_levels3;

-- This was the wrong table for this column.
alter table page_users3 drop column any_pin_cleared;


create table page_notf_prefs3(
  site_id int not null,
  people_id int not null,
  notf_level int,
  page_id int,
  pages_in_whole_site boolean,
  pages_in_category_id int,
  pages_with_tag_label_id int,
  constraint pagenotfprefs_r_people foreign key (site_id, people_id) references users3(site_id, user_id) deferrable,
  constraint pagenotfprefs_r_cats foreign key (site_id, pages_in_category_id) references categories3(site_id, id) deferrable,
  constraint pagenotfprefs_c_notf_level check (notf_level between 1 and 20),
);


create unique index pagenotfprefs_people_wholesite_u on page_notf_prefs (
  site_id, people_id)
  where pages_in_whole_site;

create unique index pagenotfprefs_people_pageid_u on page_notf_prefs (
  site_id, people_id, page_id)
  where page_id is not null;

create unique index pagenotfprefs_people_category_u on page_notf_prefs (
  site_id, people_id, pages_in_category_id)
  where pages_in_category_id is not null;

create unique index pagenotfprefs_people_taglabel_u on page_notf_prefs (
  site_id, people_id, pages_with_tag_label_id)
  where pages_with_tag_label_id is not null;


insert into page_notf_prefs(site_id, people_id, notf_level)
  select site_id, user_id, 8
  from users3 where email_for_every_new_post;


insert into page_notf_prefs(site_id, people_id, page_id, notf_level)
  select site_id, user_id, page_id,
   case notf_level
     when 1 then 8   -- notified about every post
     when 2 then 5   -- new topics
     when 3 then 4   -- tracking / highlight
     when 4 then 3   -- normal, need not save
     when 5 then 1   -- muted
   end
  from page_users3
  where notf_level between 1 and 5;

