import { DynamicTranslator } from "@/components/dynamic-translator"

export default function TranslatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Live Translation</h1>
          <p className="text-muted-foreground">Translate text in real-time using Google Translate API</p>
        </div>

        <DynamicTranslator />
      </div>
    </div>
  )
}
