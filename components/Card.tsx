import { ComponentProps, ComponentChild } from "preact";

export function Card({
  children,
  heading,
  ...rest
}: { heading: ComponentChild } & ComponentProps<"div">) {
  return (
    <div {...rest} class="p-4 border-solid shadow-md w-full">
      <h2 class="mb-2 text-xl border-b-2 w-full">{heading}</h2>
      {children}
    </div>
  );
}
