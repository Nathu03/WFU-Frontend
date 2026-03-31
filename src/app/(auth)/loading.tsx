export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-white/70 text-sm">Loading...</p>
      </div>
    </div>
  );
}
