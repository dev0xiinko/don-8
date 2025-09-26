"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

import { Mail, Chrome, Facebook, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface SocialLoginProps {
  userType: 'donor' | 'ngo'
  onSuccess?: (userData: any) => void
}

export function SocialLogin({ userType, onSuccess }: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockUserData = {
        email: provider === 'google' ? 'user@gmail.com' : 
               provider === 'facebook' ? 'user@facebook.com' : 'user@example.com',
        name: 'John Doe',
        profileImage: '/api/placeholder/32/32',
        provider: provider,
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        isVerified: false
      }
      document.cookie = `social_login=true; path=/; max-age=3600`
      document.cookie = `user_data=${JSON.stringify(mockUserData)}; path=/; max-age=3600`
      
      if (onSuccess) {
        onSuccess(mockUserData)
      }

      // Redirect based on user type
      if (userType === 'ngo') {
        router.push('/ngo/verification')
      } else {
        router.push('/donor/dashboard')
      }
    } catch (error) {
      console.error('Social login failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Google Login */}
      <Button
        variant="outline"
        className="w-full h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => handleSocialLogin('google')}
        disabled={isLoading !== null}
      >
        {isLoading === 'google' ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Chrome className="w-5 h-5 mr-2" />
        )}
        Continue with Google
      </Button>

      {/* Email Login */}
      <Button
        variant="outline"
        className="w-full h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => handleSocialLogin('email')}
        disabled={isLoading !== null}
      >
        {isLoading === 'email' ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Mail className="w-5 h-5 mr-2" />
        )}
        Continue with Email
      </Button>

      {/* Facebook Login */}
      <Button
        variant="outline"
        className="w-full h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => handleSocialLogin('facebook')}
        disabled={isLoading !== null}
      >
        {isLoading === 'facebook' ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Facebook className="w-5 h-5 mr-2" />
        )}
        Continue with Facebook
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-4">
        {userType === 'ngo' && (
          <p>After registration, you'll need to complete verification before accessing your dashboard.</p>
        )}
      </div>
    </div>
  )
}