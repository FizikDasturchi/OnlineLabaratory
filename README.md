# Fizika Fakulteti Onlayn Kutubxonasi — o'rnatish qo'llanmasi

Bu loyiha statik sayt (GitHub Pages) + Firebase (bepul tarif) asosida ishlaydi.
Firebase — hamma foydalanuvchilar bir xil ma'lumotni ko'rishi, kim nima qo'shganini
eslab qolish va fayllarni saqlash uchun kerak (GitHub Pages o'zi buni qila olmaydi).

## 1-qadam: Firebase loyihasi yaratish

1. https://console.firebase.google.com ga kiring (Google akkountingiz bilan).
2. "Add project" → loyihaga nom bering (masalan `fizika-kutubxona`) → davom eting.
3. Google Analytics so'ralsa, o'chirib qo'yishingiz mumkin (shart emas).

## 2-qadam: Web ilova qo'shish va konfiguratsiyani olish

1. Loyiha sahifasida `</>` (Web) belgisini bosing.
2. Ilovaga nom bering, "Firebase Hosting" belgisini **belgilamang** (biz GitHub Pages ishlatamiz).
3. Sizga ko'rsatiladigan `firebaseConfig` obyektini nusxalab oling — u quyidagicha ko'rinadi:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "fizika-kutubxona.firebaseapp.com",
  projectId: "fizika-kutubxona",
  storageBucket: "fizika-kutubxona.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

4. `index.html` faylini oching, pastroqdagi `<script>` blokida
   `firebaseConfig` qiymatini shu haqiqiy qiymatlar bilan almashtiring.

## 3-qadam: Google orqali kirishni yoqish (Authentication)

1. Chap menyudan **Build → Authentication → Get started**.
2. "Sign-in method" bo'limida **Google**ni tanlang → yoqing → saqlang.
3. **Authentication → Settings → Authorized domains** bo'limiga GitHub Pages
   domeningizni qo'shing (masalan `sizning-username.github.io`).

## 4-qadam: Firestore (ma'lumotlar bazasi)

1. **Build → Firestore Database → Create database**.
2. "Production mode"ni tanlang, joylashuvni tanlang (masalan `eur3`).
3. Yaratilgandan so'ng **Rules** bo'limiga o'ting va quyidagi qoidalarni joylashtiring:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        request.auth.token.email in [
          'muhammadsodiq0825@gmail.com',
          'fizikdasturchi@gmail.com'
        ];
    }
    match /sections/{sectionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if isAdmin() ||
        (request.auth != null && resource.data.createdBy == request.auth.uid);
    }
    match /books/{bookId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if isAdmin() ||
        (request.auth != null && resource.data.addedBy == request.auth.uid);
    }
  }
}
```

4. "Publish" tugmasini bosing.

Eslatma: admin email manzillarini o'zgartirmoqchi bo'lsangiz, bu yerdagi
ro'yxatni **hamda** `index.html` ichidagi `ADMIN_EMAILS` massivini bir xil
qilib yangilang — ikkalasi ham mos kelishi shart.

## 5-qadam: Storage (fayllarni saqlash)

1. **Build → Storage → Get started** → "Production mode" → davom eting.
2. **Rules** bo'limiga o'ting va quyidagini joylashtiring:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /books/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

> **Muhim cheklov:** Firebase Storage qoidalari Firestore hujjatidagi
> "kim qo'shgan" ma'lumotini to'g'ridan-to'g'ri tekshira olmaydi, shuning
> uchun fayl o'chirish huquqi asosan ilova ichidagi (Firestore orqali
> tekshiriladigan) mantiqqa tayanadi. Juda qattiq xavfsizlik kerak bo'lsa,
> buni Cloud Functions orqali kengaytirish kerak bo'ladi — bu bepul
> tarifdan tashqarida qolishi mumkin.

## 6-qadam: GitHub Pages'ga joylashtirish

1. GitHub'da yangi repository yarating (masalan `fizika-kutubxona`).
2. `index.html`, `README.md`, `favicon.ico` va `assets/` papkasini shu
   repository ildiziga yuklang.
3. Repository **Settings → Pages** bo'limiga o'ting.
4. "Branch" qismida `main` (yoki `master`) va `/ (root)` ni tanlab saqlang.
5. Bir necha daqiqadan so'ng sayt `https://sizning-username.github.io/fizika-kutubxona/`
   manzilida ishga tushadi.

## Kontent nazorati haqida muhim eslatma

So'ralganidek, "fizikaga oidligi va nomaqbul emasligi tekshirilsin" degan
talab qisman quyidagicha hal qilindi:
- Har bir material qo'shishda foydalanuvchi tasdiqlash katakchasini belgilashi shart;
- Oddiy kalit-so'z filtri (`BANNED_WORDS` ro'yxati, `index.html` ichida)
  sarlavhalarni tekshiradi;
- Ikkala admin email uchun **istalgan material yoki bo'limni** o'chirish/tahrirlash huquqi berilgan.

To'liq avtomatik (sun'iy intellekt asosida) kontent moderatsiyasi — masalan,
yuklangan PDF yoki video ichidagi mazmunni tahlil qilish — GitHub Pages +
Firebase bepul tarifida real vaqtda amalga oshmaydi, chunki bu alohida
AI/moderatsiya xizmati (masalan, Anthropic yoki Google Vision API) va
to'lovli backend talab qiladi. Hozirgi tizim — sarlavha darajasidagi filtr +
admin nazorati + jamoat e'tirozi (kerak bo'lsa, keyinchalik "shikoyat qilish"
tugmasi qo'shish mumkin).

## Qanday ishlaydi (qisqacha)

- **Bo'limlar** — Firestore `sections` kolleksiyasida saqlanadi, birinchi marta
  ochilganda 22 ta standart bo'lim avtomatik yaratiladi.
- **Materiallar** — `books` kolleksiyasida saqlanadi: `type` maydoni
  (`word`/`pdf`/`pptx`/`link`), `sectionId`, `title`, `url`, `addedBy` (Firebase UID).
- **Fayllar** (Word/PDF/Taqdimot) — Firebase Storage'ga yuklanadi,
  havolalar (YouTube) esa to'g'ridan-to'g'ri Firestore'da URL sifatida saqlanadi.
- **Egalik nazorati** — har bir foydalanuvchi faqat o'zi qo'shgan
  bo'lim/materialni tahrirlay yoki o'chira oladi; ikkala admin esa hammasini
  boshqara oladi.
- **YouTube nomi** — havola kiritilganda `youtube.com/oembed` orqali
  avtomatik aniqlanadi; aniqlanmasa, foydalanuvchidan qo'lda so'raladi.
