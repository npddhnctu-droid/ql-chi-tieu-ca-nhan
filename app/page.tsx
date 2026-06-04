import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { Sparkles, PieChart, PiggyBank, Wallet, ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <Wallet className="h-6 w-6 text-primary" />
            <span>Chi Tiêu Cá Nhân</span>
          </div>

          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-8 w-24 bg-accent animate-pulse rounded-md" />}>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] top-[-10%] left-[-10%]" />
          <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] bottom-[-10%] right-[-10%]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold border border-yellow-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tích hợp Trợ lý AI Thông Minh</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Quản Lý Tài Chính Cá Nhân <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Thông Minh Hơn Mỗi Ngày</span>
          </h1>

          <p className="max-w-2xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed">
            Theo dõi chi tiêu, lập kế hoạch ngân sách và phân tích dòng tiền nhanh chóng bằng ngôn ngữ tự nhiên với Trợ lý AI. Đơn giản, trực quan và bảo mật.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={user ? "/protected" : "/auth/login"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center gap-2 group"
            >
              <span>{user ? "Vào bảng điều khiển" : "Bắt đầu miễn phí"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!user && (
              <Link
                href="/auth/sign-up"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm border border-border/85 hover:bg-accent/80 transition-all flex items-center gap-2"
              >
                Đăng ký tài khoản
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border/20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-2xl md:text-4xl font-bold">Các tính năng nổi bật</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Mọi công cụ bạn cần để làm chủ dòng tiền và đạt được các mục tiêu tài chính của mình.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-sm space-y-4 hover:border-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Nhập liệu nhanh bằng AI</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Không còn tốn thời gian gõ từng trường dữ liệu. Chỉ cần nhập: &quot;Ăn trưa 45k&quot; hoặc &quot;Nhận lương 15tr&quot;, AI sẽ tự động phân tích loại giao dịch, số tiền và danh mục phù hợp.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-sm space-y-4 hover:border-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <PiggyBank className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Quản lý Ngân sách Hợp lý</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Thiết lập hạn mức chi tiêu hàng tháng cho từng danh mục riêng biệt. Hệ thống tự động cảnh báo bằng trực quan khi bạn tiêu dùng vượt quá 80% hạn mức.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-sm space-y-4 hover:border-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Báo cáo Dòng tiền Trực quan</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Xem báo cáo cơ cấu chi tiêu bằng biểu đồ tròn sinh động và biểu đồ cột so sánh chi tiết giữa thu nhập & chi tiêu qua các tháng. Nắm rõ tiền chảy vào, chảy ra rõ ràng.
            </p>
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section className="bg-card/30 border-t border-b border-border/20 py-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Bảo mật dữ liệu của bạn</h4>
              <p className="text-muted-foreground text-sm">
                Chúng tôi sử dụng giải pháp xác thực và cơ sở dữ liệu hàng đầu của Supabase để mã hóa và bảo vệ an toàn cho mọi thông tin giao dịch tài chính của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 py-10 bg-background/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Ứng dụng Quản Lý Chi Tiêu Cá Nhân. Phát triển trên nền tảng Next.js & Supabase.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Điều khoản</a>
            <a href="#" className="hover:underline">Bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
}