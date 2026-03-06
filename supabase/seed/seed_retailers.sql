insert into public.retailers (id, name, country, affiliate_network, base_url, is_active)
values
  ('5e2dd4f8-1156-48d4-8f96-cbb4b5f95d01', 'bol.com BE', 'BE', 'bol', 'https://www.bol.com/be/nl/', true),
  ('5e2dd4f8-1156-48d4-8f96-cbb4b5f95d02', 'LEGO.com BE', 'BE', 'direct', 'https://www.lego.com/nl-be', true),
  ('5e2dd4f8-1156-48d4-8f96-cbb4b5f95d03', 'Amazon.nl (ships to BE)', 'BE', 'amazon', 'https://www.amazon.nl', true),
  ('5e2dd4f8-1156-48d4-8f96-cbb4b5f95d04', 'bol.com NL', 'NL', 'bol', 'https://www.bol.com/nl/nl/', true),
  ('5e2dd4f8-1156-48d4-8f96-cbb4b5f95d05', 'LEGO.com NL', 'NL', 'direct', 'https://www.lego.com/nl-nl', true),
  ('5e2dd4f8-1156-48d4-8f96-cbb4b5f95d06', 'Amazon.nl', 'NL', 'amazon', 'https://www.amazon.nl', true)
on conflict (id) do update
set
  name = excluded.name,
  country = excluded.country,
  affiliate_network = excluded.affiliate_network,
  base_url = excluded.base_url,
  is_active = excluded.is_active;
