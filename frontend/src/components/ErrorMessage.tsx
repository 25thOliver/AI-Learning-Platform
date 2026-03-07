import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message = "Could not connect to server — is the API running?" }: { message?: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
    <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
    <p className="text-sm text-destructive">{message}</p>
  </div>
);

export default ErrorMessage;
