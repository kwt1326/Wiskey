import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WalletConnector } from '@/components/base/WalletConnector';

/**
 * Higher-order component that requires authentication
 * Automatically handles wallet connection and user profile loading
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P & { auth: ReturnType<typeof useAuth> }>
) {
  return function AuthenticatedComponent(props: P) {
    const auth = useAuth();

    // Show loading state while checking authentication
    if (auth.isConnecting || auth.isLoadingProfile) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p>Connecting wallet...</p>
          </CardContent>
        </Card>
      );
    }

    // Show wallet connection if not authenticated
    if (!auth.isAuthenticated) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to access this feature.
            </p>
            <WalletConnector />
          </CardContent>
        </Card>
      );
    }

    // Show error state if authentication failed
    if (auth.authError) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Authentication Error</h3>
            <p className="text-muted-foreground mb-6">
              {auth.authError.message}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Render the wrapped component with auth props
    return <WrappedComponent {...props} auth={auth} />;
  };
}