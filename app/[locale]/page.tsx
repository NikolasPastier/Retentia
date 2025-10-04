import Footer from "@/components/footer"
import LocalePageClient from "@/components/locale-page-client"
import ShaderBackground from "@/components/shader-background"

interface LocalePageProps {
  params: { locale: string }
}

export default function LocalePage({ params: { locale } }: LocalePageProps) {
  return (
    <ShaderBackground>
      <div className="min-h-screen relative">
        <LocalePageClient />
        <Footer />
      </div>
    </ShaderBackground>
  )
}
