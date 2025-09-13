import { type NextRequest, NextResponse } from "next/server"
import { supportedLanguages, defaultLanguage } from "./lib/i18n/config"

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = supportedLanguages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)

    const response = NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
    response.cookies.set("retentia-locale", locale, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    })

    return response
  }

  // Set the locale in the response headers for client-side access
  const locale = pathname.split("/")[1]
  const response = NextResponse.next()
  response.headers.set("x-locale", locale)

  response.cookies.set("retentia-locale", locale, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: "lax",
  })

  return response
}

function getLocale(request: NextRequest): string {
  const retentiaCookie = request.cookies.get("retentia-locale")?.value
  if (retentiaCookie && supportedLanguages.includes(retentiaCookie)) {
    return retentiaCookie
  }

  // Check if user has a preferred language in i18next cookies (fallback)
  const cookieLocale = request.cookies.get("i18nextLng")?.value
  if (cookieLocale && supportedLanguages.includes(cookieLocale)) {
    return cookieLocale
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage.split(",").map((lang) => lang.split(";")[0].trim().toLowerCase())

    for (const lang of preferredLanguages) {
      // Check exact match
      if (supportedLanguages.includes(lang)) {
        return lang
      }

      // Check language without region (e.g., 'en' from 'en-US')
      const langWithoutRegion = lang.split("-")[0]
      if (supportedLanguages.includes(langWithoutRegion)) {
        return langWithoutRegion
      }
    }
  }

  return defaultLanguage
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico|.*\\..*).*)/",
    // Optional: only run on root (/) URL
    "/",
  ],
}
