/*
  # Multi-Language Support Schema
  
  Adds support for multiple languages and translations:
  1. languages table - stores available languages
  2. translations table - stores UI translations
  3. content_translations table - stores content translations
*/

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- tr, en, de, fr, etc.
  name text NOT NULL, -- Turkish, English, German
  native_name text NOT NULL, -- Türkçe, English, Deutsch
  flag_emoji text, -- 🇹🇷, 🇬🇧, 🇩🇪
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create translations table (for UI strings)
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  namespace text NOT NULL, -- 'common', 'admin', 'games', 'footer', 'header'
  key text NOT NULL, -- 'header.login', 'footer.copyright', 'games.search'
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(language_code, namespace, key)
);

-- Create content_translations table (for content like games, videos)
CREATE TABLE IF NOT EXISTS content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  instructions text,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_id, language_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translations_language_namespace ON translations(language_code, namespace);
CREATE INDEX IF NOT EXISTS idx_content_translations_content ON content_translations(content_id);
CREATE INDEX IF NOT EXISTS idx_content_translations_language ON content_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active);
CREATE INDEX IF NOT EXISTS idx_languages_default ON languages(is_default);

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for languages (public read)
CREATE POLICY "Languages are viewable by everyone"
  ON languages FOR SELECT
  USING (true);

CREATE POLICY "Languages are editable by admins"
  ON languages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for translations (public read)
CREATE POLICY "Translations are viewable by everyone"
  ON translations FOR SELECT
  USING (true);

CREATE POLICY "Translations are editable by admins"
  ON translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'editor')
    )
  );

-- RLS Policies for content_translations (public read)
CREATE POLICY "Content translations are viewable by everyone"
  ON content_translations FOR SELECT
  USING (true);

CREATE POLICY "Content translations are editable by admins"
  ON content_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'editor')
    )
  );

-- Insert default languages (10 languages)
INSERT INTO languages (code, name, native_name, flag_emoji, is_active, is_default, sort_order) VALUES
  ('tr', 'Turkish', 'Türkçe', '🇹🇷', true, true, 1),
  ('en', 'English', 'English', '🇬🇧', true, false, 2),
  ('de', 'German', 'Deutsch', '🇩🇪', true, false, 3),
  ('fr', 'French', 'Français', '🇫🇷', true, false, 4),
  ('es', 'Spanish', 'Español', '🇪🇸', true, false, 5),
  ('it', 'Italian', 'Italiano', '🇮🇹', true, false, 6),
  ('ru', 'Russian', 'Русский', '🇷🇺', true, false, 7),
  ('ar', 'Arabic', 'العربية', '🇸🇦', true, false, 8),
  ('pt', 'Portuguese', 'Português', '🇵🇹', true, false, 9),
  ('nl', 'Dutch', 'Nederlands', '🇳🇱', true, false, 10)
ON CONFLICT (code) DO NOTHING;

-- Insert default Turkish translations (common namespace)
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('tr', 'common', 'search', 'Ara'),
  ('tr', 'common', 'loading', 'Yükleniyor...'),
  ('tr', 'common', 'error', 'Hata oluştu'),
  ('tr', 'common', 'save', 'Kaydet'),
  ('tr', 'common', 'cancel', 'İptal'),
  ('tr', 'common', 'delete', 'Sil'),
  ('tr', 'common', 'edit', 'Düzenle'),
  ('tr', 'common', 'add', 'Ekle'),
  ('tr', 'common', 'yes', 'Evet'),
  ('tr', 'common', 'no', 'Hayır'),
  ('tr', 'header', 'home', 'Ana Sayfa'),
  ('tr', 'header', 'categories', 'Kategoriler'),
  ('tr', 'header', 'search', 'Oyun ara...'),
  ('tr', 'header', 'login', 'Giriş Yap'),
  ('tr', 'header', 'profile', 'Profilim'),
  ('tr', 'header', 'favorites', 'Favorilerim'),
  ('tr', 'header', 'history', 'İzleme Geçmişi'),
  ('tr', 'header', 'settings', 'Ayarlar'),
  ('tr', 'header', 'logout', 'Çıkış Yap'),
  ('tr', 'footer', 'copyright', '© 2024 SeriGame. Tüm hakları saklıdır.'),
  ('tr', 'footer', 'about', 'Hakkımızda'),
  ('tr', 'footer', 'privacy', 'Gizlilik Politikası'),
  ('tr', 'footer', 'terms', 'Kullanım Koşulları'),
  ('tr', 'games', 'play', 'Oyna'),
  ('tr', 'games', 'favorite', 'Favorilere Ekle'),
  ('tr', 'games', 'unfavorite', 'Favorilerden Çıkar'),
  ('tr', 'games', 'rating', 'Puan'),
  ('tr', 'games', 'play_count', 'Oynanma')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert English translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('en', 'common', 'search', 'Search'),
  ('en', 'common', 'loading', 'Loading...'),
  ('en', 'common', 'error', 'An error occurred'),
  ('en', 'common', 'save', 'Save'),
  ('en', 'common', 'cancel', 'Cancel'),
  ('en', 'common', 'delete', 'Delete'),
  ('en', 'common', 'edit', 'Edit'),
  ('en', 'common', 'add', 'Add'),
  ('en', 'common', 'yes', 'Yes'),
  ('en', 'common', 'no', 'No'),
  ('en', 'header', 'home', 'Home'),
  ('en', 'header', 'categories', 'Categories'),
  ('en', 'header', 'search', 'Search games...'),
  ('en', 'header', 'login', 'Login'),
  ('en', 'header', 'profile', 'My Profile'),
  ('en', 'header', 'favorites', 'My Favorites'),
  ('en', 'header', 'history', 'Watch History'),
  ('en', 'header', 'settings', 'Settings'),
  ('en', 'header', 'logout', 'Logout'),
  ('en', 'footer', 'copyright', '© 2024 SeriGame. All rights reserved.'),
  ('en', 'footer', 'about', 'About'),
  ('en', 'footer', 'privacy', 'Privacy Policy'),
  ('en', 'footer', 'terms', 'Terms of Service'),
  ('en', 'games', 'play', 'Play'),
  ('en', 'games', 'favorite', 'Add to Favorites'),
  ('en', 'games', 'unfavorite', 'Remove from Favorites'),
  ('en', 'games', 'rating', 'Rating'),
  ('en', 'games', 'play_count', 'Plays')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert German translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('de', 'common', 'search', 'Suchen'),
  ('de', 'common', 'loading', 'Laden...'),
  ('de', 'common', 'error', 'Ein Fehler ist aufgetreten'),
  ('de', 'common', 'save', 'Speichern'),
  ('de', 'common', 'cancel', 'Abbrechen'),
  ('de', 'common', 'delete', 'Löschen'),
  ('de', 'common', 'edit', 'Bearbeiten'),
  ('de', 'common', 'add', 'Hinzufügen'),
  ('de', 'common', 'yes', 'Ja'),
  ('de', 'common', 'no', 'Nein'),
  ('de', 'header', 'home', 'Startseite'),
  ('de', 'header', 'categories', 'Kategorien'),
  ('de', 'header', 'search', 'Spiele suchen...'),
  ('de', 'header', 'login', 'Anmelden'),
  ('de', 'header', 'profile', 'Mein Profil'),
  ('de', 'header', 'favorites', 'Meine Favoriten'),
  ('de', 'header', 'history', 'Verlauf'),
  ('de', 'header', 'settings', 'Einstellungen'),
  ('de', 'header', 'logout', 'Abmelden'),
  ('de', 'footer', 'copyright', '© 2024 SeriGame. Alle Rechte vorbehalten.'),
  ('de', 'footer', 'about', 'Über uns'),
  ('de', 'footer', 'privacy', 'Datenschutz'),
  ('de', 'footer', 'terms', 'Nutzungsbedingungen'),
  ('de', 'games', 'play', 'Spielen'),
  ('de', 'games', 'favorite', 'Zu Favoriten hinzufügen'),
  ('de', 'games', 'unfavorite', 'Aus Favoriten entfernen'),
  ('de', 'games', 'rating', 'Bewertung'),
  ('de', 'games', 'play_count', 'Spiele')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert French translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('fr', 'common', 'search', 'Rechercher'),
  ('fr', 'common', 'loading', 'Chargement...'),
  ('fr', 'common', 'error', 'Une erreur est survenue'),
  ('fr', 'common', 'save', 'Enregistrer'),
  ('fr', 'common', 'cancel', 'Annuler'),
  ('fr', 'common', 'delete', 'Supprimer'),
  ('fr', 'common', 'edit', 'Modifier'),
  ('fr', 'common', 'add', 'Ajouter'),
  ('fr', 'common', 'yes', 'Oui'),
  ('fr', 'common', 'no', 'Non'),
  ('fr', 'header', 'home', 'Accueil'),
  ('fr', 'header', 'categories', 'Catégories'),
  ('fr', 'header', 'search', 'Rechercher des jeux...'),
  ('fr', 'header', 'login', 'Connexion'),
  ('fr', 'header', 'profile', 'Mon Profil'),
  ('fr', 'header', 'favorites', 'Mes Favoris'),
  ('fr', 'header', 'history', 'Historique'),
  ('fr', 'header', 'settings', 'Paramètres'),
  ('fr', 'header', 'logout', 'Déconnexion'),
  ('fr', 'footer', 'copyright', '© 2024 SeriGame. Tous droits réservés.'),
  ('fr', 'footer', 'about', 'À propos'),
  ('fr', 'footer', 'privacy', 'Politique de confidentialité'),
  ('fr', 'footer', 'terms', 'Conditions d''utilisation'),
  ('fr', 'games', 'play', 'Jouer'),
  ('fr', 'games', 'favorite', 'Ajouter aux favoris'),
  ('fr', 'games', 'unfavorite', 'Retirer des favoris'),
  ('fr', 'games', 'rating', 'Note'),
  ('fr', 'games', 'play_count', 'Parties')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert Spanish translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('es', 'common', 'search', 'Buscar'),
  ('es', 'common', 'loading', 'Cargando...'),
  ('es', 'common', 'error', 'Ocurrió un error'),
  ('es', 'common', 'save', 'Guardar'),
  ('es', 'common', 'cancel', 'Cancelar'),
  ('es', 'common', 'delete', 'Eliminar'),
  ('es', 'common', 'edit', 'Editar'),
  ('es', 'common', 'add', 'Agregar'),
  ('es', 'common', 'yes', 'Sí'),
  ('es', 'common', 'no', 'No'),
  ('es', 'header', 'home', 'Inicio'),
  ('es', 'header', 'categories', 'Categorías'),
  ('es', 'header', 'search', 'Buscar juegos...'),
  ('es', 'header', 'login', 'Iniciar sesión'),
  ('es', 'header', 'profile', 'Mi Perfil'),
  ('es', 'header', 'favorites', 'Mis Favoritos'),
  ('es', 'header', 'history', 'Historial'),
  ('es', 'header', 'settings', 'Configuración'),
  ('es', 'header', 'logout', 'Cerrar sesión'),
  ('es', 'footer', 'copyright', '© 2024 SeriGame. Todos los derechos reservados.'),
  ('es', 'footer', 'about', 'Acerca de'),
  ('es', 'footer', 'privacy', 'Política de privacidad'),
  ('es', 'footer', 'terms', 'Términos de servicio'),
  ('es', 'games', 'play', 'Jugar'),
  ('es', 'games', 'favorite', 'Agregar a favoritos'),
  ('es', 'games', 'unfavorite', 'Quitar de favoritos'),
  ('es', 'games', 'rating', 'Calificación'),
  ('es', 'games', 'play_count', 'Jugadas')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert Italian translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('it', 'common', 'search', 'Cerca'),
  ('it', 'common', 'loading', 'Caricamento...'),
  ('it', 'common', 'error', 'Si è verificato un errore'),
  ('it', 'common', 'save', 'Salva'),
  ('it', 'common', 'cancel', 'Annulla'),
  ('it', 'common', 'delete', 'Elimina'),
  ('it', 'common', 'edit', 'Modifica'),
  ('it', 'common', 'add', 'Aggiungi'),
  ('it', 'common', 'yes', 'Sì'),
  ('it', 'common', 'no', 'No'),
  ('it', 'header', 'home', 'Home'),
  ('it', 'header', 'categories', 'Categorie'),
  ('it', 'header', 'search', 'Cerca giochi...'),
  ('it', 'header', 'login', 'Accedi'),
  ('it', 'header', 'profile', 'Il Mio Profilo'),
  ('it', 'header', 'favorites', 'I Miei Preferiti'),
  ('it', 'header', 'history', 'Cronologia'),
  ('it', 'header', 'settings', 'Impostazioni'),
  ('it', 'header', 'logout', 'Esci'),
  ('it', 'footer', 'copyright', '© 2024 SeriGame. Tutti i diritti riservati.'),
  ('it', 'footer', 'about', 'Chi siamo'),
  ('it', 'footer', 'privacy', 'Privacy'),
  ('it', 'footer', 'terms', 'Termini di servizio'),
  ('it', 'games', 'play', 'Gioca'),
  ('it', 'games', 'favorite', 'Aggiungi ai preferiti'),
  ('it', 'games', 'unfavorite', 'Rimuovi dai preferiti'),
  ('it', 'games', 'rating', 'Valutazione'),
  ('it', 'games', 'play_count', 'Partite')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert Russian translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('ru', 'common', 'search', 'Поиск'),
  ('ru', 'common', 'loading', 'Загрузка...'),
  ('ru', 'common', 'error', 'Произошла ошибка'),
  ('ru', 'common', 'save', 'Сохранить'),
  ('ru', 'common', 'cancel', 'Отмена'),
  ('ru', 'common', 'delete', 'Удалить'),
  ('ru', 'common', 'edit', 'Редактировать'),
  ('ru', 'common', 'add', 'Добавить'),
  ('ru', 'common', 'yes', 'Да'),
  ('ru', 'common', 'no', 'Нет'),
  ('ru', 'header', 'home', 'Главная'),
  ('ru', 'header', 'categories', 'Категории'),
  ('ru', 'header', 'search', 'Поиск игр...'),
  ('ru', 'header', 'login', 'Войти'),
  ('ru', 'header', 'profile', 'Мой Профиль'),
  ('ru', 'header', 'favorites', 'Избранное'),
  ('ru', 'header', 'history', 'История'),
  ('ru', 'header', 'settings', 'Настройки'),
  ('ru', 'header', 'logout', 'Выйти'),
  ('ru', 'footer', 'copyright', '© 2024 SeriGame. Все права защищены.'),
  ('ru', 'footer', 'about', 'О нас'),
  ('ru', 'footer', 'privacy', 'Политика конфиденциальности'),
  ('ru', 'footer', 'terms', 'Условия использования'),
  ('ru', 'games', 'play', 'Играть'),
  ('ru', 'games', 'favorite', 'Добавить в избранное'),
  ('ru', 'games', 'unfavorite', 'Удалить из избранного'),
  ('ru', 'games', 'rating', 'Рейтинг'),
  ('ru', 'games', 'play_count', 'Игр')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert Portuguese translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('pt', 'common', 'search', 'Pesquisar'),
  ('pt', 'common', 'loading', 'Carregando...'),
  ('pt', 'common', 'error', 'Ocorreu um erro'),
  ('pt', 'common', 'save', 'Salvar'),
  ('pt', 'common', 'cancel', 'Cancelar'),
  ('pt', 'common', 'delete', 'Excluir'),
  ('pt', 'common', 'edit', 'Editar'),
  ('pt', 'common', 'add', 'Adicionar'),
  ('pt', 'common', 'yes', 'Sim'),
  ('pt', 'common', 'no', 'Não'),
  ('pt', 'header', 'home', 'Início'),
  ('pt', 'header', 'categories', 'Categorias'),
  ('pt', 'header', 'search', 'Pesquisar jogos...'),
  ('pt', 'header', 'login', 'Entrar'),
  ('pt', 'header', 'profile', 'Meu Perfil'),
  ('pt', 'header', 'favorites', 'Meus Favoritos'),
  ('pt', 'header', 'history', 'Histórico'),
  ('pt', 'header', 'settings', 'Configurações'),
  ('pt', 'header', 'logout', 'Sair'),
  ('pt', 'footer', 'copyright', '© 2024 SeriGame. Todos os direitos reservados.'),
  ('pt', 'footer', 'about', 'Sobre'),
  ('pt', 'footer', 'privacy', 'Política de Privacidade'),
  ('pt', 'footer', 'terms', 'Termos de Serviço'),
  ('pt', 'games', 'play', 'Jogar'),
  ('pt', 'games', 'favorite', 'Adicionar aos favoritos'),
  ('pt', 'games', 'unfavorite', 'Remover dos favoritos'),
  ('pt', 'games', 'rating', 'Avaliação'),
  ('pt', 'games', 'play_count', 'Jogos')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert Dutch translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('nl', 'common', 'search', 'Zoeken'),
  ('nl', 'common', 'loading', 'Laden...'),
  ('nl', 'common', 'error', 'Er is een fout opgetreden'),
  ('nl', 'common', 'save', 'Opslaan'),
  ('nl', 'common', 'cancel', 'Annuleren'),
  ('nl', 'common', 'delete', 'Verwijderen'),
  ('nl', 'common', 'edit', 'Bewerken'),
  ('nl', 'common', 'add', 'Toevoegen'),
  ('nl', 'common', 'yes', 'Ja'),
  ('nl', 'common', 'no', 'Nee'),
  ('nl', 'header', 'home', 'Home'),
  ('nl', 'header', 'categories', 'Categorieën'),
  ('nl', 'header', 'search', 'Zoek spellen...'),
  ('nl', 'header', 'login', 'Inloggen'),
  ('nl', 'header', 'profile', 'Mijn Profiel'),
  ('nl', 'header', 'favorites', 'Mijn Favorieten'),
  ('nl', 'header', 'history', 'Geschiedenis'),
  ('nl', 'header', 'settings', 'Instellingen'),
  ('nl', 'header', 'logout', 'Uitloggen'),
  ('nl', 'footer', 'copyright', '© 2024 SeriGame. Alle rechten voorbehouden.'),
  ('nl', 'footer', 'about', 'Over ons'),
  ('nl', 'footer', 'privacy', 'Privacybeleid'),
  ('nl', 'footer', 'terms', 'Servicevoorwaarden'),
  ('nl', 'games', 'play', 'Spelen'),
  ('nl', 'games', 'favorite', 'Toevoegen aan favorieten'),
  ('nl', 'games', 'unfavorite', 'Verwijderen uit favorieten'),
  ('nl', 'games', 'rating', 'Beoordeling'),
  ('nl', 'games', 'play_count', 'Spellen')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Insert Arabic translations
INSERT INTO translations (language_code, namespace, key, value) VALUES
  ('ar', 'common', 'search', 'بحث'),
  ('ar', 'common', 'loading', 'جاري التحميل...'),
  ('ar', 'common', 'error', 'حدث خطأ'),
  ('ar', 'common', 'save', 'حفظ'),
  ('ar', 'common', 'cancel', 'إلغاء'),
  ('ar', 'common', 'delete', 'حذف'),
  ('ar', 'common', 'edit', 'تعديل'),
  ('ar', 'common', 'add', 'إضافة'),
  ('ar', 'common', 'yes', 'نعم'),
  ('ar', 'common', 'no', 'لا'),
  ('ar', 'header', 'home', 'الرئيسية'),
  ('ar', 'header', 'categories', 'الفئات'),
  ('ar', 'header', 'search', 'البحث عن الألعاب...'),
  ('ar', 'header', 'login', 'تسجيل الدخول'),
  ('ar', 'header', 'profile', 'ملفي الشخصي'),
  ('ar', 'header', 'favorites', 'مفضلاتي'),
  ('ar', 'header', 'history', 'السجل'),
  ('ar', 'header', 'settings', 'الإعدادات'),
  ('ar', 'header', 'logout', 'تسجيل الخروج'),
  ('ar', 'footer', 'copyright', '© 2024 SeriGame. جميع الحقوق محفوظة.'),
  ('ar', 'footer', 'about', 'من نحن'),
  ('ar', 'footer', 'privacy', 'سياسة الخصوصية'),
  ('ar', 'footer', 'terms', 'شروط الخدمة'),
  ('ar', 'games', 'play', 'لعب'),
  ('ar', 'games', 'favorite', 'إضافة إلى المفضلة'),
  ('ar', 'games', 'unfavorite', 'إزالة من المفضلة'),
  ('ar', 'games', 'rating', 'التقييم'),
  ('ar', 'games', 'play_count', 'الألعاب')
ON CONFLICT (language_code, namespace, key) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON languages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_translations_updated_at BEFORE UPDATE ON content_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

