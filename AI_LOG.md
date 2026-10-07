# AI_LOG

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
- Kullanıcı tablosu/session/RBAC/parola sıfırlama; challenge kapsamını ve bütçelenemeyen operasyon
  yükünü büyütmemek için uygulanmadı. Daha geniş üretim kapsamı için hash'lenmiş parola, SMTP,
  reCAPTCHA ve 2FA birlikte tasarlanmalıydı. Özel SMTP servisi projeye açılmadı; Mailpit + mTLS ve
  sunucu güvenliği çalışması da test kapsamını büyüteceği için `mailto:` kararı korundu.
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

Çalışma tek Codex oturumunda, alt ajan kullanılmadan gerçekleştirildi. Ürün ve teknik kararların
tamamı aynı bağlam içinde gözden geçirildi.
