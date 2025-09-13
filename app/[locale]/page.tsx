import Footer from "@/components/footer"
import LocalePageClient from "@/components/locale-page-client"

interface LocalePageProps {
  params: { locale: string }
}

export default function LocalePage({ params: { locale } }: LocalePageProps) {
  return (
    <div className="min-h-screen gradient-bg">
      <LocalePageClient />
      <Footer />
    </div>
  )
}
