# Chi Tiêu App 

## Mô tả dự án

**Chi Tiêu App** là một ứng dụng quản lý chi tiêu cá nhân được xây dựng bằng **Next.js 16 (App Router)** và **Supabase**. Ứng dụng hỗ trợ:
- Theo dõi ngân sách theo danh mục.
- Lịch sử giao dịch với giao diện hiện đại.
- Thông báo khi vượt ngân sách.
- Đăng nhập/đăng ký qua Supabase Auth.

## Tính năng chính

- **Quản lý ngân sách**: đặt ngân sách cho từng danh mục và tháng.
- **Lịch sử giao dịch**: xem, lọc, sửa, xóa giao dịch.
- **Cảnh báo ngân sách**: hiển thị toast khi chi tiêu vượt mức.
- **Giao diện đẹp**: sử dụng `shadcn/ui`, TailwindCSS và hiệu ứng glassmorphism.
- **Triển khai nhanh**: có nút Deploy trên Vercel tích hợp Supabase.

## Demo

Bạn có thể xem bản demo trực tuyến tại: https://demo-nextjs-with-supabase.vercel.app (đây là bản mẫu, dự án của bạn sẽ chạy tương tự).

## Triển khai lên Vercel

1. Truy cập https://vercel.com/new và chọn **Import Git Repository**.
2. Dán URL repository: `https://github.com/npddhnctu-droid/ql-chi-tieu-ca-nhan`.
3. Vercel sẽ tự động tạo biến môi trường từ `.env.example`. Bạn chỉ cần **cấp quyền Supabase** trong phần **Integrations**.
4. Khi triển khai xong, ứng dụng sẽ chạy trên `https://your-project.vercel.app`.

## Cài đặt và chạy locally

### 1. Yêu cầu
- Node.js >= 18
- Yarn hoặc npm
- Tài khoản Supabase

### 2. Tạo dự án Supabase
1. Đăng nhập vào [Supabase dashboard](https://app.supabase.com) và tạo **project mới**.
2. Vào **Settings → API** để lấy **URL** và **Public Anon Key** (hoặc Publishable Key).

### 3. Clone repository và cài đặt
```bash
git clone https://github.com/npddhnctu-droid/ql-chi-tieu-ca-nhan.git
cd ql-chi-tieu-ca-nhan
npm install   # hoặc yarn install
```

### 4. Cấu hình môi trường
```bash
# sao chép file mẫu
cp .env.example .env.local

# chỉnh sửa .env.local với thông tin Supabase của bạn
NEXT_PUBLIC_SUPABASE_URL=<<YOUR_SUPABASE_URL>>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<<YOUR_SUPABASE_PUBLIC_KEY>>
```
> **Lưu ý**: Biến `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` có thể dùng `ANON_KEY` nếu dự án vẫn đang ở định dạng cũ.

### 5. Chạy server dev
```bash
npm run dev
```
Mở trình duyệt tại `http://localhost:3000` để xem ứng dụng.

## Cấu trúc thư mục chính
```
app/                 # Các route và server components
 ├─ protected/      # Các trang bảo vệ (budgets, transactions, …)
 └─ auth/           # Đăng nhập, signup, reset password …
components/          # UI components (button, card, dialog, …)
lib/                  # Supabase client và tiện ích
public/               # Tài nguyên tĩnh
```

## Đóng góp
Mọi đóng góp đều được chào đón!  
1. Fork repository.
2. Tạo nhánh mới (`git checkout -b feature/xyz`).
3. Thực hiện thay đổi, commit và push.
4. Tạo Pull Request trên GitHub.

## Giấy phép
Dự án được cấp phép theo **MIT License** – xem file `LICENSE` để biết chi tiết.
