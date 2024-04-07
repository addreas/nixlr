import { ComponentProps, ComponentChild } from "preact";

export function Card({
  children,
  heading,
  ...rest
}: { heading: ComponentChild } & ComponentProps<"div">) {
  return (
    <div {...rest} class="card border-solid shadow-xl w-full">
      <div class="card-body">
        <h2 class="card-title">{heading}</h2>
        {children}
      </div>
    </div>
  );
}
