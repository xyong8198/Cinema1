export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple passthrough - AuthProvider is already in root layout
  return <>{children}</>;
}
