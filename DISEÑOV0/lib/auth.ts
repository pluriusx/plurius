import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { createClient } from '@/utils/supabase/server'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email) return false

      const supabase = await createClient()

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('users')
          .update({
            name: user.name,
            avatar_url: user.image,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
        return true
      }

      // First-time user — create record but they won't have an agency yet
      await supabase.from('users').insert({
        email: user.email,
        name: user.name,
        avatar_url: user.image,
      })

      return true
    },

    async jwt({ token, user, account }) {
      if (account && user?.email) {
        const supabase = await createClient()

        const { data: dbUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single()

        if (dbUser) {
          token.userId = dbUser.id

          const { data: membership } = await supabase
            .from('agency_members')
            .select('agency_id, role')
            .eq('user_id', dbUser.id)
            .maybeSingle()

          if (membership) {
            token.agencyId = membership.agency_id
            token.role = membership.role
          }
        }
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.userId as string
      session.user.agencyId = token.agencyId as string | undefined
      session.user.role = token.role as string | undefined
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
})
