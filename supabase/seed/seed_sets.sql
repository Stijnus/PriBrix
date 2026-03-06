insert into public.sets (id, set_num, name, theme, year, image_url, msrp_eur)
values
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e01', '10316-1', 'The Lord of the Rings: Rivendell', 'Icons', 2023, 'https://images.rebrickable.com/media/sets/10316-1.jpg', 499.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e02', '42146-1', 'Liebherr Crawler Crane LR 13000', 'Technic', 2023, 'https://images.rebrickable.com/media/sets/42146-1.jpg', 679.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e03', '75331-1', 'The Razor Crest', 'Star Wars', 2022, 'https://images.rebrickable.com/media/sets/75331-1.jpg', 599.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e04', '21348-1', 'Dungeons & Dragons: Red Dragon''s Tale', 'Ideas', 2024, 'https://images.rebrickable.com/media/sets/21348-1.jpg', 359.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e05', '76269-1', 'Avengers Tower', 'Marvel Super Heroes', 2023, 'https://images.rebrickable.com/media/sets/76269-1.jpg', 499.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e06', '71411-1', 'The Mighty Bowser', 'Super Mario', 2022, 'https://images.rebrickable.com/media/sets/71411-1.jpg', 269.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e07', '10307-1', 'Eiffel Tower', 'Icons', 2022, 'https://images.rebrickable.com/media/sets/10307-1.jpg', 629.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e08', '60439-1', 'Space Science Lab', 'City', 2024, 'https://images.rebrickable.com/media/sets/60439-1.jpg', 34.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e09', '31152-1', 'Space Astronaut', 'Creator', 2024, 'https://images.rebrickable.com/media/sets/31152-1.jpg', 49.99),
  ('90c8dd70-5dbf-4528-9a3b-ec1348370e10', '42639-1', 'Andrea''s Modern Mansion', 'Friends', 2024, 'https://images.rebrickable.com/media/sets/42639-1.jpg', 199.99)
on conflict (set_num) do update
set
  name = excluded.name,
  theme = excluded.theme,
  year = excluded.year,
  image_url = excluded.image_url,
  msrp_eur = excluded.msrp_eur;
