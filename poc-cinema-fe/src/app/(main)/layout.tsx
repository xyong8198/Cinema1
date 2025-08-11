import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/footer";
import Protected from "@/middleware/Protected";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </Protected>
  );
}
