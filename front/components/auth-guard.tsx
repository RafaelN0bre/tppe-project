"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { LogIn } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <LogIn className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>You need to be logged in to access this page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/auth/login" className="block">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
