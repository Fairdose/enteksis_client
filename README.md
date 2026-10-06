# Enteksis Client

Enteksis için Türkçe öncelikli, responsive ve erişilebilir hizmet landing page'i. Vue 3,
TypeScript, Pinia ve Vue Router ile geliştirilmiştir.

## Gereksinimler

- Docker Desktop veya Docker Engine ve Docker Compose v2
- Linux/macOS üzerinde Bash; Windows üzerinde Git Bash veya WSL
- Repoların aynı üst dizinde `enteksis_client` ve `enteksis_backend` adlarıyla bulunması

## Kurulum

Client, API ve PostgreSQL'i tek komutla başlatın:

```sh
./run.sh
```

Windows'ta Git Bash veya WSL terminalinden çalıştırın:

```sh
bash ./run.sh
```

Uygulama `http://localhost:5173`, API `http://localhost:8080`, PostgreSQL ise
`localhost:5432` adresinde çalışır. Formda
başarı mesajı yalnızca API PostgreSQL kaydını tamamlayıp `201 Created` döndürdüğünde gösterilir.

Script her iki repoda da aynı içeriktedir ve aynı Compose projesini yönetir:

```sh
./run.sh start    # Build edip arka planda başlatır; varsayılan komuttur
./run.sh status   # Container durumlarını gösterir
./run.sh logs     # Logları takip eder
./run.sh restart  # Yeniden build edip başlatır
./run.sh stop     # Servisleri durdurur, database volume'ünü korur
```

Docker kullanmadan frontend geliştirmek için Node.js 24.12+ ve pnpm 12+ ile `pnpm install` ve
`pnpm dev` kullanılabilir.

## Mimari kararlar

- Türkçe varsayılandır; İngilizce içerik dil düğmesiyle açılır.
- Router domain bazlıdır. `public.route.ts`, `layout-view` named view içine `LayoutPublic`, layout
  ise `public-view` içine nested `HomeView` render eder.
- `HomeView` yalnızca feature section'larını orkestre eder. Home'a özel parçalar
  `views/home/_components`, tekrar kullanılabilir uygulama bileşenleri `components`, layout'lar
  `layouts` altında tutulur.
- Vite alias'ları `fileURLToPath(new URL(..., import.meta.url))` ile çözülür: `@`,
  `~components`, `~layouts`, `~store` ve `~views`.
- Pinia store'ları tekil `src/store/<domain>` dizininde state ve tipleri ayrıştırarak tutulur.
- Pinia yalnızca dil ve seçilen hizmet tercihini kalıcı tutar. İsim ve e-posta gibi kişisel
  bilgiler `localStorage` içine yazılmaz.
- İstemci doğrulaması hızlı geri bildirim sağlar; güvenlik ve veri bütünlüğü için aynı kurallar
  backend'de tekrar uygulanır.
- API adresi `VITE_API_BASE_URL` ile değiştirilir.

```text
src/
  components/{brand,footers,headers}/
  layouts/LayoutPublic.vue
  router/
    index.ts
    routes/{_entry,public.route}.ts
  store/preferences/{index,types}.ts
  views/home/
    HomeView.vue
    _components/
```

## Erişilebilirlik

- Semantik başlık sırası, label'lı form alanları ve klavye odak stilleri
- Hatalı alanlarda `aria-invalid` ve ilişkili hata açıklamaları
- Gönderim hatası ve başarı durumu için canlı bölgeler
- `prefers-reduced-motion` desteği ve mobil menü

## Bilinen eksikler

- Tarayıcılar arası görsel regresyon testi challenge süresi nedeniyle eklenmemiştir.
- Windows'ta `.sh` dosyası PowerShell veya CMD tarafından doğrudan çalıştırılamaz; Git Bash ya da
  WSL kullanılmalıdır.

Herhangi bir hazır landing page şablonu kullanılmadı. Tasarım ve uygulama bu challenge için
sıfırdan oluşturuldu.
