# Setup SMTP untuk SAWIT Email Service

## Status Perbaikan Kode ✅

Kode sudah diperbaiki dan di-push ke branch:
- **Branch**: `sandbox/0ccbce9c-d78c-47ee-9f65--97bp`
- **Commit**: Fix email service: improve SMTP error handling and dev mode support
- **Files Modified**:
  - `server/app/services/email.py` - Enhanced email sending dengan error handling
  - `server/app/core/config.py` - Updated default OTP_DEV_MODE to False

## Langkah-Langkah Setup

### Step 1: Merge PR ke Development Branch

1. Buka GitHub: https://github.com/maxrumbo/CapstoneProject_CC26-PSU329
2. Buat Pull Request dari `sandbox/0ccbce9c-d78c-47ee-9f65--97bp` ke `development`
3. Review dan merge PR
4. Atau langsung merge ke `main` jika ingin langsung ke production

### Step 2: Pilih SMTP Provider

Pilih salah satu opsi di bawah:

#### **Opsi A: Gmail (Recommended untuk Testing)**

**Kelebihan:**
- Gratis
- Mudah setup
- Reliable

**Setup:**

1. Buka https://myaccount.google.com/security
2. Aktifkan "2-Step Verification" jika belum
3. Cari "App passwords" → Pilih "Mail" dan "Windows Computer"
4. Google akan generate password 16 karakter
5. Copy password tersebut

**Environment Variables untuk Railway:**
```
OTP_DEV_MODE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx (app password dari Google)
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=SAWIT
SMTP_USE_TLS=true
```

---

#### **Opsi B: SendGrid (Recommended untuk Production)**

**Kelebihan:**
- Free tier: 100 emails/hari
- Professional service
- Good deliverability
- Analytics dashboard

**Setup:**

1. Daftar di https://sendgrid.com (free tier)
2. Verify email Anda
3. Dashboard → Settings → API Keys
4. Create API Key (Full Access)
5. Copy API key

**Environment Variables untuk Railway:**
```
OTP_DEV_MODE=false
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-api-key-here
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=SAWIT
SMTP_USE_TLS=true
```

---

#### **Opsi C: Brevo (Generous Free Tier)**

**Kelebihan:**
- Free tier: 300 emails/hari
- Lebih generous dari SendGrid
- Good untuk development

**Setup:**

1. Daftar di https://www.brevo.com
2. Verify email Anda
3. Dashboard → SMTP & API
4. Copy SMTP credentials

**Environment Variables untuk Railway:**
```
OTP_DEV_MODE=false
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=your-brevo-email@example.com
SMTP_PASSWORD=your-brevo-smtp-password
SMTP_FROM_EMAIL=your-verified-email@yourdomain.com
SMTP_FROM_NAME=SAWIT
SMTP_USE_TLS=true
```

---

### Step 3: Set Environment Variables di Railway

1. **Buka Railway Dashboard:**
   - https://railway.com/project/61902efc-d942-4ceb-9caa-2a0cc3be5994

2. **Pilih Service "SAWIT-server"**

3. **Klik Tab "Variables"**

4. **Tambahkan/Update Variables:**
   - Paste semua SMTP variables sesuai opsi yang dipilih
   - Klik "Save"

5. **Trigger Redeploy:**
   - Klik "Deploy" atau push commit baru ke development branch
   - Railway akan otomatis redeploy dengan variables baru

### Step 4: Test Email Sending

**Test 1: Register dengan Email Verification**

```bash
curl -X POST https://sawit-server-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "display_name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "id": "...",
    "email": "test@example.com",
    "display_name": "Test User",
    "email_verified_at": null
  },
  "message": "Registrasi berhasil. Cek email untuk verifikasi akun."
}
```

**Check:**
- Cek inbox untuk verification email
- Jika tidak ada, cek spam folder
- Klik link di email untuk verify

---

**Test 2: Request OTP**

```bash
curl -X POST https://sawit-server-production.up.railway.app/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "signup"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "expires_at": "2024-06-01T10:15:00Z",
    "otp_code": "123456"
  },
  "message": "OTP dikirim ke email."
}
```

**Check:**
- Cek inbox untuk OTP email
- OTP code juga di-return dalam response (untuk testing)

---

## Troubleshooting

### ❌ Error: "Konfigurasi SMTP belum lengkap"

**Penyebab:** `SMTP_HOST` atau `SMTP_FROM_EMAIL` tidak di-set

**Solusi:**
- Pastikan semua SMTP variables sudah di-set di Railway
- Klik "Save" setelah menambah variables
- Trigger redeploy

---

### ❌ Error: "Gagal autentikasi SMTP"

**Penyebab:** Username atau password salah

**Solusi:**
- Untuk Gmail: Gunakan App Password, bukan password biasa
- Untuk SendGrid: Username harus `apikey`
- Double-check credentials di SMTP provider

---

### ❌ Error: "Gagal terhubung ke server email"

**Penyebab:** SMTP host tidak accessible atau port salah

**Solusi:**
- Cek `SMTP_HOST` dan `SMTP_PORT` benar
- Port 587 (TLS) atau 465 (SSL) biasanya standard
- Pastikan `SMTP_USE_TLS=true` untuk port 587

---

### ❌ Email tidak terkirim tapi tidak ada error

**Penyebab:** Email terkirim tapi masuk spam atau tidak terkirim

**Solusi:**
- Cek spam folder di inbox penerima
- Cek logs di Railway untuk error messages
- Verify sender email address di SMTP provider
- Untuk production: Setup SPF, DKIM records di DNS

---

## Development Mode (Testing tanpa SMTP)

Jika ingin test tanpa mengirim email sebenarnya:

**Set Variable:**
```
OTP_DEV_MODE=true
```

**Behavior:**
- Emails akan di-print ke logs
- Tidak perlu SMTP configuration
- Endpoints akan return success
- Cek Railway logs untuk email content

---

## Rekomendasi

| Scenario | Provider | Alasan |
|----------|----------|--------|
| **Local Development** | `OTP_DEV_MODE=true` | Cepat, tidak perlu SMTP |
| **Testing** | Gmail | Gratis, mudah setup |
| **Production** | SendGrid/Brevo | Professional, reliable, analytics |

---

## Checklist

- [ ] Merge PR ke development/main branch
- [ ] Pilih SMTP provider
- [ ] Setup credentials di SMTP provider
- [ ] Set environment variables di Railway
- [ ] Trigger redeploy
- [ ] Test register endpoint
- [ ] Check inbox untuk verification email
- [ ] Test request-otp endpoint
- [ ] Verify OTP email terkirim

---

## Support

Jika ada masalah:
1. Cek Railway logs untuk error messages
2. Verify SMTP credentials di provider
3. Test SMTP connection dengan telnet/nc
4. Cek email provider documentation

---

**Status:** ✅ Kode sudah diperbaiki, tinggal setup SMTP credentials

