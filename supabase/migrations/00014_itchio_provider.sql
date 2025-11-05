-- Itch.io Oyun Sağlayıcısı Ekle
INSERT INTO game_providers (name, slug, api_endpoint, auth_type, auth_header_name, revenue_share, config) VALUES
  (
    'Itch.io',
    'itchio',
    'https://itch.io/api/1/[username]/games', -- Placeholder, manual import için
    'none',
    '',
    100.00, -- Itch.io'da revenue share yok, %100 senin
    '{
      "categoryMapping": {
        "action": "child",
        "adventure": "child",
        "arcade": "child",
        "puzzle": "child",
        "racing": "child",
        "sports": "child",
        "strategy": "adult",
        "casual": "family",
        "educational": "baby",
        "kids": "baby",
        "pinball": "child",
        "roguelike": "adult"
      },
      "responsePath": "games",
      "fields": {
        "title": "title",
        "description": "short_text",
        "thumbnail": "cover_url",
        "url": "url",
        "embedUrl": "embed_url",
        "category": "classification",
        "rating": "rating",
        "duration": null,
        "featured": "published",
        "tags": "tags"
      },
      "embedFormat": "iframe",
      "embedTemplate": "<iframe src=\"{embedUrl}\" width=\"552\" height=\"167\" frameborder=\"0\"></iframe>"
    }'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  config = EXCLUDED.config;

