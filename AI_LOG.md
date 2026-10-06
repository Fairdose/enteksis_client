# AI_LOG

## Kullanılan araçlar

- Codex: proje iskeleti, bileşenler, testler ve dokümantasyon
- Context7: Vue, Pinia, Vue Router, persisted-state, Docker Compose ve Docker'ın Vue/nginx
  dokümantasyon kontrolü
- Vitest ve Vue Test Utils: form doğrulama, başarı ve hata durumları
- Playwright: masaüstü/mobil tarayıcı akışları ve gerçek Docker API form kaydı

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
  Giriş bilgileri kullanıcı yönlendirmesiyle statik `admin` / `123456admin` olarak belirlendi.
  SMTP/Mailpit önerisi kullanıcı yönlendirmesiyle kaldırıldı; cevap metnini güvenli biçimde encode
  eden ve varsayılan posta uygulamasını açan `mailto:` yaklaşımı uygulandı.
- Ürün adı kullanıcı yönlendirmesiyle `Ent Challange` olarak değiştirildi; arayüz metinleri,
  tarayıcı metadatası ve oturum anahtarı aynı kimlik altında birleştirildi.

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

## Görev dağılımı

Çalışma tek Codex oturumunda, alt ajan kullanılmadan gerçekleştirildi. Ürün ve teknik kararların
tamamı aynı bağlam içinde gözden geçirildi.
