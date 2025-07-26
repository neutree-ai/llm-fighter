import { handleAuthCallback } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/oauth/callback")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { error, isLoading, status } = useQuery({
    queryKey: ["auth-callback"],
    queryFn: handleAuthCallback,
    retry: false,
  });

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate({ to: "/", reloadDocument: true });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [navigate, status]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-[80px] bg-background">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {isLoading && (
              <>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Authenticating...</h2>
                  <p className="text-sm">
                    Please wait while we complete your sign-in
                  </p>
                </div>
              </>
            )}

            {status === "success" && !isLoading && (
              <>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">
                    Authentication Successful!
                  </h2>
                  <p className="text-sm">Redirecting to homepage...</p>
                </div>
              </>
            )}

            {error && (
              <>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="space-y-4 w-full">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">
                      Authentication Failed
                    </h2>
                    <p className="text-sm">
                      There was a problem during sign-in, please try again
                    </p>
                  </div>

                  <Alert className="text-left bg-red-50">
                    <AlertDescription className="text-sm text-red-400">
                      {error instanceof Error
                        ? error.message
                        : "Unknown error occurred, please try again"}
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col gap-2 w-full">
                    <Button onClick={handleRetry} className="w-full">
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGoBack}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
