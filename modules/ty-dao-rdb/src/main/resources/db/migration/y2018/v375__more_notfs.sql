
alter table categories3 rename unlisted to unlist_category;
alter table categories3 add column unlist_topics boolean;

drop table tag_notf_levels3;


create table page_notf_prefs(
  site_id int not null,
  people_id int not null,
  pages_in_category_id int,
  pages_with_tag_label_id int,
  pages_with_tag_value_id int,
  page_id int,
  notf_level int,  -- watching_all, watching_first, tracking, normal, muted
  constraint usercattags_r_people foreign key (site_id, people_id) references users3(site_id, user_id) deferrable,
  constraint usercatagss_r_cats foreign key (site_id, category_id) references categories3(site_id, id) deferrable
);


create unique index user_categories_userid_u on user_categories3 (
  site_id, user_id) where category_id is null;

create unique index user_categories_userid_categoryid_u on user_categories3 (
  site_id, user_id, category_id) where category_id is not null;



insert into categories(site_id, user_id, notify_of_new_posts)
  select site_id, user_id, true from users3 where email_for_every_new_post;

alter table users3 drop column email_for_every_new_post;


