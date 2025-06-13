"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from 'react-toastify'
import { createBrowserClient } from "@/lib/supabase"
import { Loader2, Link as LinkIcon, Unlink, Info } from "lucide-react"
import type { UserIdentity } from "@supabase/supabase-js"

export function OAuthAccountsManager() {
  const [identities, setIdentities] = useState<UserIdentity[]>([])
  const [loading, setLoading] = useState(true)
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)

  useEffect(() => {
    loadIdentities()
  }, [])

  const loadIdentities = async () => {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.getUserIdentities()
      
      if (error) {
        console.error("Error loading identities:", error)
        toast.error("Failed to load linked accounts")
        return
      }

      setIdentities(data.identities || [])
    } catch (error) {
      console.error("Error loading identities:", error)
    } finally {
      setLoading(false)
    }
  }

  const linkOAuthAccount = async (provider: 'google' | 'github') => {
    // Show informative message about potential issues
    toast.info(`Attempting to link your ${provider === 'google' ? 'Google' : 'GitHub'} account. If you have an existing account with the same email, the process may not work properly.`, {
      autoClose: 8000
    })

    setLinkingProvider(provider)
    try {
      const supabase = createBrowserClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      
      const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${siteUrl}/profile/edit?linked=${provider}`
        }
      })

      if (error) {
        console.error(`Error linking ${provider}:`, error)
        
        // More specific error messages
        if (error.message.includes('Multiple accounts')) {
          toast.error(`Cannot link ${provider === 'google' ? 'Google' : 'GitHub'} account because you already have an account with this email. For security reasons, Supabase does not allow automatic account linking.`)
        } else if (error.message.includes('email')) {
          toast.error(`Email address issue when linking ${provider === 'google' ? 'Google' : 'GitHub'} account.`)
        } else {
          toast.error(`Failed to link ${provider === 'google' ? 'Google' : 'GitHub'} account: ${error.message}`)
        }
        return
      }

      if (data.url) {
        toast.success(`Redirecting you to ${provider === 'google' ? 'Google' : 'GitHub'} for confirmation...`)
        // Redirect to OAuth provider
        window.location.href = data.url
      }
    } catch (error) {
      console.error(`Error linking ${provider}:`, error)
      toast.error(`Failed to link ${provider === 'google' ? 'Google' : 'GitHub'} account`)
    } finally {
      setLinkingProvider(null)
    }
  }

  const unlinkAccount = async (identity: UserIdentity) => {
    if (identities.length <= 1) {
      toast.warning("You must have at least one authentication method")
      return
    }

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.unlinkIdentity(identity)

      if (error) {
        console.error("Error unlinking identity:", error)
        toast.error(`Failed to unlink ${identity.provider} account`)
        return
      }

      toast.success(`${identity.provider} account has been unlinked successfully`)

      // Reload identities
      loadIdentities()
    } catch (error) {
      console.error("Error unlinking identity:", error)
      toast.error("Failed to unlink account")
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )
      case 'github':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        )
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  const isProviderLinked = (provider: string) => {
    return identities.some(identity => identity.provider === provider)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>Manage your connected OAuth accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
        <CardDescription>
          Manage your connected OAuth accounts. You can sign in using any of these methods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current linked accounts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Connected Accounts</h4>
          {identities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No OAuth accounts linked</p>
          ) : (
            identities.map((identity) => (
              <div key={identity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                  <div className="flex items-center gap-2">
                    {getProviderIcon(identity.provider)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium capitalize break-all">{identity.provider}</p>
                    {identity.identity_data?.email && (
                      <p className="text-sm text-muted-foreground break-all">{identity.identity_data.email}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="w-fit">Connected</Badge>
                </div>
                {identities.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => unlinkAccount(identity)}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Unlink
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Available providers to link */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Available Accounts</h4>
          
          {/* Information alert about linking limitations */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> If you already have an account with the same email address in another OAuth provider, 
              linking may not work due to security restrictions of Supabase. 
              In this case, you will receive an error message "Multiple accounts detected".
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 gap-3">
            {!isProviderLinked('google') && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                  {getProviderIcon('google')}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium break-all">Google</p>
                    <p className="text-sm text-muted-foreground break-all">Link your Google account</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => linkOAuthAccount('google')}
                  disabled={linkingProvider === 'google'}
                >
                  {linkingProvider === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <LinkIcon className="h-4 w-4 mr-1" />
                  )}
                  Link
                </Button>
              </div>
            )}

            {!isProviderLinked('github') && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                  {getProviderIcon('github')}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium break-all">GitHub</p>
                    <p className="text-sm text-muted-foreground break-all">Link your GitHub account</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => linkOAuthAccount('github')}
                  disabled={linkingProvider === 'github'}
                >
                  {linkingProvider === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <LinkIcon className="h-4 w-4 mr-1" />
                  )}
                  Link
                </Button>
              </div>
            )}
          </div>
        </div>

        {identities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">
              Link OAuth accounts to sign in more easily and securely.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 