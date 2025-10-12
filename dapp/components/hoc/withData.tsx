import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DataState {
  data?: any;
  isLoading: boolean;
  error: Error | null;
  refetch?: () => void;
}

interface WithDataProps {
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  showRefetch?: boolean;
}

/**
 * Higher-order component that handles data loading states
 * Automatically shows loading, error, and empty states
 */
export function withData<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  dataSelector: (props: P) => DataState,
  options: WithDataProps = {}
) {
  return function DataComponent(props: P) {
    const { data, isLoading, error, refetch } = dataSelector(props);
    const {
      loadingComponent,
      errorComponent,
      emptyComponent,
      showRefetch = true
    } = options;

    // Show loading state
    if (isLoading) {
      if (loadingComponent) {
        return <>{loadingComponent}</>;
      }
      
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Show error state
    if (error) {
      if (errorComponent) {
        return <>{errorComponent}</>;
      }
      
      return (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            {showRefetch && refetch && (
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    // Show empty state
    if (!data || (Array.isArray(data) && data.length === 0)) {
      if (emptyComponent) {
        return <>{emptyComponent}</>;
      }
      
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No data found.</p>
          </CardContent>
        </Card>
      );
    }

    // Render the wrapped component with data
    return <WrappedComponent {...props} />;
  };
}