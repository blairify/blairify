import Logo from "@/components/common/atoms/logo-blairify";
import { Typography } from "@/components/common/atoms/typography";

interface LoadingPageProps {
  message?: string;
}

export default function LoadingPage({ message }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center animate-pulse space-y-4">
        <Logo iconSize={100} variant="iconOnly" />
        {message && (
          <Typography.Body color="secondary" className="mt-4">
            {message}
          </Typography.Body>
        )}
      </div>
    </div>
  );
}
