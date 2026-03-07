const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div className="h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
    <p className="text-sm font-medium text-muted-foreground animate-pulse-soft">{text}</p>
  </div>
);

export default LoadingSpinner;
