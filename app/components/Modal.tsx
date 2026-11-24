export function Modal({
  children,
}: {
  children: React.ReactNode;
  cancelLink: string;
}) {
  return (
    <div
      className="relative z-[200]"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      id="modal-bg"
    >
      <div className="fixed inset-0 transition-opacity bg-opacity-75 bg-primary/40"></div>
      <div className="fixed inset-0 z-[200] overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 sm:p-0">
          <div
            className="relative flex-1 px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform rounded shadow-xl bg-contrast sm:my-12 sm:flex-none sm:w-full sm:max-w-xl lg:max-w-2xl sm:p-8"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyPress={(e) => {
              e.stopPropagation();
            }}
            tabIndex={0}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
