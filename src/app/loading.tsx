export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div
        className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        role="status"
        aria-label="Cargando aplicación"
      />
    </div>
  );
}
