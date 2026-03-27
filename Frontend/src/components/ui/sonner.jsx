import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => (
  <Sonner
    theme="light"
    className="toaster group"
    toastOptions={{
      classNameFunction: undefined,
      className: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
      descriptionClassName: "group-[.toast]:text-slate-500",
    }}
    {...props}
  />
)

export { Toaster }
