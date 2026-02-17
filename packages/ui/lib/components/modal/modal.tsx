import { Dialog, VisuallyHidden } from "radix-ui";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";

interface ModalProps {
  title: string;
  description: string;
  showCloseButton?: boolean;
  trigger?: React.ReactElement<typeof Button>;
  actions: React.ReactElement<typeof Button>[];
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Modal = ({
  title,
  description,
  showCloseButton = true,
  trigger,
  actions,
  content,
  open,
  onOpenChange,
}: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="bg-neutral-dark-gray/40 inset-0 fixed backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-96 min-h-80 rounded-2xl border border-neutral-dark-gray/20 shadow-2xl bg-neutral-white/20 p-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50">
          <div className="flex flex-col flex-1 bg-white rounded-xl border border-neutral-dark-gray/20 shadow-sm overflow-hidden">
            <div className="flex-none flex justify-between items-center h-10 py-3 pr-3 pl-5 shrink-0 border-b border-neutral-dark-gray/10 text-sm font-medium">
              <Dialog.Title>{title}</Dialog.Title>
              {showCloseButton && (
                <Dialog.Close className="flex items-center transition-colors text-neutral-dark-gray ring-2 ring-transparent rounded-sm hover:text-black hover:cursor-pointer hover:ring-black/20 focus:ring-black/20">
                  <Icon type="close" />
                  <span className="sr-only">Close</span>
                </Dialog.Close>
              )}
              <VisuallyHidden.Root>
                <Dialog.Description>{description}</Dialog.Description>
              </VisuallyHidden.Root>
            </div>
            <div className="flex-1 py-3 px-5">{content}</div>
            <div className="flex-none flex justify-end items-center gap-3 h-14 p-3 bg-neutral-white border-t border-neutral-dark-gray/10">
              {actions}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { Modal };
