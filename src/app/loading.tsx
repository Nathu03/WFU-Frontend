export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
        <p className="text-brand-primary/70 text-sm">Loading...</p>
      </div>
    </div>
  );
}
