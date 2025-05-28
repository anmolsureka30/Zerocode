interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  isVisible,
  message = "Generating Your App",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 flex flex-col items-center justify-center z-10">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
        We're building your application based on your description. This might take a few moments...
      </p>
    </div>
  );
}
