# Ent Challange Client

Enteksis Benim Masam V0.1 ve önceki hizmet sayfası için Türkçe öncelikli Vue 3 istemcisi. TypeScript, Pinia ve Vue Router kullanır.

## Gereksinimler

- Docker Desktop veya Docker Engine ve Docker Compose v2
- Linux/macOS üzerinde Bash; Windows üzerinde Git Bash veya WSL
- Repoların aynı üst dizinde `enteksis_client` ve `enteksis_backend` adlarıyla bulunması

## Kurulum

Client, API ve PostgreSQL'i tek komutla başlatın:

```sh
cp ../enteksis_backend/.env.example ../enteksis_backend/.env
# .env içindeki admin kimlik bilgilerini teslim kanalındaki değerlerle değiştirin.
./run.sh
```

Windows'ta Git Bash veya WSL terminalinden çalıştırın:

```sh
bash ./run.sh
```

Uygulama `http://localhost:5173`, API `http://localhost:8080`, PostgreSQL ise
`localhost:5432` adresinde çalışır. Formda
başarı mesajı yalnızca API PostgreSQL kaydını tamamlayıp `201 Created` döndürdüğünde gösterilir.

Gönderilen talepleri incelemek için `http://localhost:5173/admin` adresini açın. Admin kimlik
bilgileri backend `.env` dosyasından alınır ve teslim kanalıyla ayrıca paylaşılır.
Admin ekranında talepler durumlarına göre filtrelenebilir; detay açıldığında `Okundu` olur,
`Cevaplandı` olarak işaretlenebilir veya onay alınarak kalıcı biçimde silinebilir.

`/admin/masa` ikinci fazın operasyon merkezidir. Yönetici ekip ve proje oluşturur, görevi sahip/sorumlu/inceleyen atamalarıyla açar. Her ekip üyesi kendi e-posta ve şifresiyle giriş yapar; gecikenler, engelliler, bugün son gün, bana atananlar, incelemem gerekenler, sahibi olduklarım, başkasından beklediklerim ve katkı verdiklerim gruplarını görür. Görev çekmecesinden kontrol listesi, katılımcı, engel, kanıtlı teslim, inceleme ve yeniden atama yürütülür. PDF bağlantısı açık üst menüde ve masada bulunur.

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

## Testler

Unit testleri ve statik kontroller:

```sh
pnpm install
pnpm lint
pnpm test:unit -- --run
pnpm build
```

Playwright uçtan uca testleri gerçek Docker API ve PostgreSQL ile çalışır. Stack'i başlattıktan
sonra üç tarayıcı motorunu ilk kullanımda kurup testleri çalıştırın:

```sh
./run.sh start
pnpm exec playwright install chromium firefox webkit
set -a; source ../enteksis_backend/.env; set +a
pnpm test:e2e
```

Testler Chromium, Firefox ve WebKit masaüstünde Türkçe/İngilizce dil kalıcılığını, istemci
doğrulamasını, gönderim ve API hatası durumlarını, gerçek veritabanına başarılı kaydı; admin
giriş/liste/detay/`mailto:` akışını kapsar. Chromium mobil emülasyonunda menü ve yatay taşma;
axe-core ile public sayfa ve admin girişinin WCAG A/AA kuralları ayrıca sınanır. Benim Masam testi gerçek API ile proje/görev oluşturma, durum ilerletme ve PDF erişimini doğrular.

## Mimari kararlar

- Türkçe varsayılandır; typed mesaj kataloğundaki İngilizce public ve admin içerikleri dil
  düğmesiyle açılır. Dil tercihi iki route ağacında da korunur ve belge dili güncellenir.
- Router domain bazlıdır. `public.route.ts`, `layout-view` named view içine `LayoutPublic`, layout
  ise `public-view` içine nested `HomeView` render eder.
- Admin route'ları `/admin` altında nested yapıdadır. `LayoutAdmin`, `admin-view` içine giriş,
  talep listesi ve talep detayı view'larını render eder.
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
    routes/{_entry,admin.route,public.route}.ts
  store/{admin,preferences}/{index,types}.ts
  views/admin/{login,requests}/
  views/home/
    HomeView.vue
    _components/
```

## Erişilebilirlik

- Semantik başlık sırası, label'lı form alanları ve klavye odak stilleri
- Hatalı alanlarda `aria-invalid` ve ilişkili hata açıklamaları
- Gönderim hatası ve başarı durumu için canlı bölgeler
- `prefers-reduced-motion` desteği ve mobil menü
- Public sayfa ve admin girişinde Playwright + axe-core ile otomatik WCAG A/AA kontrolü

## Bilinen eksikler

- Windows'ta `.sh` dosyası PowerShell veya CMD tarafından doğrudan çalıştırılamaz; Git Bash ya da
  WSL kullanılmalıdır.
- Eski talep yönetimi HTTP Basic kullanır. Benim Masam'da ekip hesapları ve sunucu oturumları vardır; self servis parola sıfırlama ve ikinci faktör henüz yoktur.
- Yanıtlama `mailto:` ile varsayılan e-posta uygulamasını açar; uygulama mesajın gerçekten
  gönderildiğini doğrulayamaz. Mevcut SMTP servisi özel altyapıda çalıştığı için bu projeye açılmadı.
  Mailpit ile test edilebilirdi ancak sunucu güvenliği ve mTLS entegrasyonu challenge kapsamını
  genişleteceğinden uygulanmadı; cevap durumu yönetici tarafından açıkça işaretlenir.
- Admin panelinde istemci taraflı temel arama ve durum filtresi vardır; sunucu taraflı sayfalama ve
  gelişmiş arama yoktur. Doğru yaklaşım beklenen veri hacmi ve arama gereksinimine göre değişeceği;
  indeksleme, arama algoritması ve gerekirse cache katmanı için ürün kararı gerektirdiği için küçük
  challenge veri setine spekülatif altyapı eklenmedi.

Herhangi bir hazır landing page şablonu kullanılmadı. Tasarım ve uygulama bu challenge için
sıfırdan oluşturuldu.
