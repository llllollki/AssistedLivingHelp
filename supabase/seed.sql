insert into public.launch_markets (slug, name, hospital_anchor)
values
  ('temecula-valley', 'Temecula Valley', 'Temecula Valley Hospital'),
  ('inland-valley', 'Inland Valley', 'Inland Valley Hospital'),
  ('rancho-springs', 'Rancho Springs', 'Rancho Springs Hospital'),
  ('murrieta-loma-linda', 'Murrieta Loma Linda', 'Loma Linda University Medical Center - Murrieta'),
  ('menifee-global', 'Menifee Global', 'Menifee Global Medical Center')
on conflict (slug) do nothing;
