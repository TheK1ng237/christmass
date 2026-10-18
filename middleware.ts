// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request: { headers: request.headers } })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname
    const nonIndexableRoutes = [
        '/auth',
        '/dashboard',
        '/create',
        '/batch',
        '/admin',
        '/test-session',
        '/preview',
    ]
    const isNonIndexableRoute = nonIndexableRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    )

    if (isNonIndexableRoute) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    }

    // 1. Routes privées utilisateurs
    const isProtectedRoute =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/create') ||
        pathname.startsWith('/batch');

    if (isProtectedRoute && !user) {
        const url = new URL('/auth', request.url)
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // 2. Route admin — réservée à l'admin
    if (pathname.startsWith('/admin')) {
        if (!user) {
            const url = new URL('/auth', request.url)
            url.searchParams.set('next', pathname)
            return NextResponse.redirect(url)
        }
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
        const isAdmin =
            user.email?.toLowerCase() === adminEmail ||
            user.user_metadata?.role === 'admin'

        if (!isAdmin) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 3. Redirige utilisateur connecté hors de /auth
    if (pathname.startsWith('/auth') && user) {
        const nextPath = request.nextUrl.searchParams.get('next') || '/dashboard'
        return NextResponse.redirect(new URL(nextPath, request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
    ],
}