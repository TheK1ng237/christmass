// Layout isolé pour /admin — exclut la Navbar globale
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
