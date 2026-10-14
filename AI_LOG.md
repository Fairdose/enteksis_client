# AI_LOG

## Marka ve dil seçici düzeltmesi (14 Ekim 2026)

- Kullanıcı isteğiyle görünür marka, başlık ve açıklama `ent-challange` adına döndü. Kanonik PDF içeriği kaynak belge olarak korundu.
- Açılış ve yönetim başlığında ortak `LanguageSelector` native açılır seçicisi kullanıldı; geçerli dilin bayrağı görünür, Türkçe/English seçenekleri klavye ve ekran okuyucu ile erişilebilir. Tercih mevcut Pinia kalıcılığından okunur.
- Son marka taramasında yönetim erişilebilirlik etiketi, hazır e-posta başlığı/imzası ve masa formundaki örnek adres de düzeltildi.
- Vue typecheck/lint, dört Vitest testi ve Vite üretim derlemesi geçti. Chromium/Firefox üzerinde dil tercihi kalıcılığı, axe erişilebilirlik ve responsive görünümü kapsayan 10 hedefli Playwright çalıştırması geçti; 390 px mobil menüde bayraklı kontrol görsel olarak denetlendi.

## İkinci faz — görsel açılış revizyonu (14 Ekim 2026)

### Görev dağılımı ve kararlar

- Üç uzman görev kullanıldı: kanonik/teklif belgelerinin görsel ve ürün brifi, Vue/CSS landing uygulaması, tarayıcı/erişilebilirlik denetimi. Ana görev sonuçları birleştirdi.
- Hero, Benim Masam'ın görev → sorumluluk → kanıtlı teslim → inceleme değerini CSS perspektifli katmanlarla gösterir. Dekoratif örnek veriler gerçek müşteri veya canlı KPI iddiası taşımaz.
- Hareket CSS ile sınırlıdır; sistemin azaltılmış hareket tercihi ve mobil genişlikler korunur. Ürün PDF'si, masaya giriş ve hizmet talebi bağlantıları görünür kalır.

### Doğrulama

- Vue typecheck, ESLint, Oxlint, dört Vitest testi ve Vite üretim derlemesi geçti.
- Chromium/Firefox ile 320, 390, 620, 621, 900, 901 ve 1440 px genişliklerde yatay taşma ve ana eylem sınırları; azaltılmış hareket; eski hizmet talebi ve Benim Masam akışları doğrulandı. Mobil Chromium dahil 28 Playwright çalıştırması geçti. WebKit'in yerel sistem bağımlılıkları eksik olduğu için üç motorlu doğrulama CI ortamına bırakıldı.

## İkinci faz — 14 Ekim 2026

### Kullanılan araçlar ve kaynaklar

- Codex: Benim Masam görünümü, oturum store'u, görev çekmecesi, form/eylem akışları, responsive stil ve test.
- Context7: Vue `script setup`, reactivity ve liste render belgeleri.
- Playwright/Chromium: gerçek API ile giriş, proje/görev oluşturma, durum ilerletme, PDF `application/pdf` yanıtı ve 390 px mobil yatay taşma kontrolü. Görseller masaüstü/mobil olarak gözle incelendi.

### Teknik kararlar

- Eski hizmet sayfası ve talep admin'i korundu; Benim Masam `/admin/masa` altında ayrı Bearer oturumuyla açıldı. İşlem düğmeleri yalnız API `allowed_actions` verisine göre görünür, sunucu her mutasyonda yetkiyi yeniden sınar.
- Sekiz masa grubu tek API yanıtından yüklenir. Masaüstünde alarm/iş akışı/sahiplik düzeni, mobilde kayan alarm şeridi ve tam genişlik görev çekmecesi kullanılır.
- Kanonik Türkçe `ENTEKSIS_Urun_Tanitimi.pdf`, baytları değiştirilmeden public asset'e kopyalanıp açık sayfadan ve masadan bağlandı.
- Hata, boş ve yüklenme durumları ayrı gösterilir; işlem hataları çekmece açıkken çekmecede görünür. `Idempotency-Key` her yeni mutasyonda rastgele UUID olarak üretilir.

### Doğrulama

- Vue typecheck, ESLint, Oxlint, dört Vitest testi, production build ve gerçek PostgreSQL'e karşı Chromium/Firefox Playwright Benim Masam testleri geçti. Yerel WebKit sistem bağımlılıkları eksik; CI kurulumu bu motoru kapsıyor.
- Mobil 390 px görünümde belge genişliği 390 px ölçüldü; yatay taşma giderildi.


## Kullanılan araçlar

- Codex: proje iskeleti, bileşenler, testler ve dokümantasyon
- Context7: Vue, Pinia, Vue Router, persisted-state, Playwright, axe-core, Docker Compose ve
  Docker'ın Vue/nginx dokümantasyon kontrolü
- Vitest ve Vue Test Utils: form doğrulama, başarı ve hata durumları
- Playwright ve axe-core: üç masaüstü tarayıcı motoru, mobil akışlar, otomatik WCAG kontrolleri ve
  gerçek Docker API form kaydı

## Kabul edilen ve değiştirilen öneriler

- Resmi `create-vue` iskeleti TypeScript, Router, Pinia, Vitest, ESLint ve Prettier ile kabul
  edildi; örnek sayaç ve başlangıç ekranı ürün bileşenleriyle değiştirildi.
- Kalıcı Pinia store kullanıldı ancak kişisel form verisinin saklanması reddedildi. Yalnızca dil
  ve hizmet tercihi kalıcıdır.
- Supabase ilk teknik bağlamda yer alıyordu. Değerlendirmenin yerel yapılacağı bilgisi üzerine
  PostgreSQL, migration ve API Docker Compose içine taşındı.
- Hazır UI şablonu yerine responsive tasarım sıfırdan üretildi.
- Kullanıcının `example_infra` referansındaki domain router, named nested view, layout ve
  feature-colocation yaklaşımı kabul edildi. Uygulamanın küçük ölçeğine uymayan auth guard ve
  kapsam dışı domain katmanları eklenmedi.
- GitHub Pages teslim yaklaşımı kullanıcı kararıyla kaldırıldı. Client, API ve PostgreSQL tek
  Compose projesinde; iki repodaki aynı platform-bağımsız Bash giriş noktasıyla çalıştırıldı.
- Admin için `/admin` altında nested layout, giriş, talep listesi ve detay route'ları eklendi.
  Başlangıçta statik belirlenen giriş bilgileri son güvenlik kontrolünde environment secret'a taşındı.
  SMTP/Mailpit önerisi kullanıcı yönlendirmesiyle kaldırıldı; cevap metnini güvenli biçimde encode
  eden ve varsayılan posta uygulamasını açan `mailto:` yaklaşımı uygulandı.
- Ürün adı kullanıcı yönlendirmesiyle `Ent Challange` olarak değiştirildi; arayüz metinleri,
  tarayıcı metadatası ve oturum anahtarı aynı kimlik altında birleştirildi.
- Admin talepleri durum filtreleme, otomatik okundu işareti, açık cevaplandı işlemi ve onaylı silme
  ile CRUD akışına genişletildi. `mailto:` açılmasının gönderim kanıtı olmadığı özellikle korundu.
- Admin giriş alanı e-posta semantiğine geçirildi; gerçek kimlik bilgileri test kaynaklarından
  çıkarılıp çalışma ortamından alınacak şekilde düzenlendi.
- Yeni bir Vue I18n bağımlılığı önerisi incelendi ancak public arayüzde typed Türkçe/İngilizce mesaj
  kataloğu, kalıcı locale store'u ve dil değiştirici zaten bulunduğu için reddedildi. Mevcut küçük
  altyapı admin mesajlarını da kapsayacak şekilde tamamlandı; dil tercihi tüm route'larda korundu.
- Görsel regresyon challenge kapsamı dışında bırakıldı. Buna karşılık tarayıcı uyumluluğu Chromium,
  Firefox ve WebKit projeleriyle; otomatik erişilebilirlik axe-core WCAG A/AA taramasıyla kapsandı.
- İlk fazda kullanıcı oturumu yoktu. İkinci fazda Benim Masam için Bearer oturumu ve sunucu taraflı
  görev yetkileri eklendi. Self servis parola sıfırlama ve 2FA kapsam dışında; eski hizmet talebi
  yanıtında `mailto:` kararı korundu.
- Sunucu taraflı sayfalama ve gelişmiş arama, beklenen veri hacmi ve aranacak alanlar netleşmeden
  cache/indeks/arama algoritması seçmek spekülatif olacağı için eklenmedi; küçük veri setinde mevcut
  istemci araması ve durum filtresi korundu.

## Doğrulama kaydı

- İlk tip kontrolünde persisted-state tip genişletmesinin otomatik yüklenmediği görüldü.
  Store'a açık type side-effect import eklenerek düzeltildi.
- Frontend: lint, 4 Vitest testi, TypeScript kontrolü ve Vite production build çalıştırıldı.
- Backend: container içinde Go testleri çalıştırıldı.
- Docker Compose ile PostgreSQL ve API ayağa kaldırıldı; `/health` yanıtı kontrol edildi.
- API'ye gerçek bir hizmet talebi gönderildi ve satır PostgreSQL içinde sorgulandı.
- Form tarayıcıda dolduruldu; API `201` döndükten sonra başarı ekranının göründüğü doğrulandı.
- Playwright ile dil tercihi kalıcılığı, dört alanın istemci doğrulaması, gönderiliyor durumu,
  kontrollü API hatası, mobil menü ve yatay taşma otomatik olarak sınandı.
- Başarılı Playwright isteğinin `201 Created` aldığı ve kaydın Docker PostgreSQL tablosunda
  bulunduğu ayrıca doğrulandı.
- İlk admin Playwright akışında hatalı girişten sonra logout işleminin hata mesajını da temizlediği
  görüldü; mesaj korunarak düzeltildi.
- Playwright'ın yedi senaryosu; yanlış/doğru admin girişi, talep arama ve detay görüntüleme ile
  konu/gövde içeren URL-encode edilmiş `mailto:` bağlantısını da kapsayacak şekilde geçti.
- Admin Playwright akışı kalıcı `Okundu`/`Cevaplandı` geçişini ve onay sonrası silmeyi kapsayacak
  şekilde genişletildi; masaüstü ve mobil dokuz farklı Playwright senaryosu geçti.
- Playwright masaüstü projeleri Chromium, Firefox ve WebKit'e genişletildi; CI browser kurulumu üç
  motoru kapsayacak şekilde güncellendi. Türkçe/İngilizce tercihinin admin route'unda da sürdüğü
  otomatik testle doğrulandı.
- İlk axe-core WCAG A/AA taraması süreç bölümündeki ikincil metinler ile footer metinlerinde yetersiz
  renk kontrastı buldu. İlgili renkler AA eşiğini geçecek şekilde yükseltildi ve public sayfa ile
  admin giriş taramaları ihlalsiz tekrarlandı. Dokuz masaüstü senaryosunun üç motor çalıştırması ve
  iki Chromium mobil senaryosu toplam 29 başarılı tarayıcı çalıştırması oluşturdu.
- Hizmet kartında hover sırasında yatay padding değişiminin başlık geometrisini kaydırdığı görüldü.
  Geometri değiştiren animasyon kaldırılıp yalnız arka plan geçişi korundu; başlığın bounding box
  değerlerinin hover öncesi ve sonrasında aynı kaldığı Playwright testiyle güvenceye alındı.

## Görev dağılımı

İlk faz çalışması tek Codex oturumunda, alt ajan kullanılmadan gerçekleştirildi. İkinci fazdaki
açılış sayfası revizyonu yukarıdaki üç uzman görevle yürütüldü.
