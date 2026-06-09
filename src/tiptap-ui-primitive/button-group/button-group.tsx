import { forwardRef } from "react"
import { cn } from "@/lib/tiptap-utils"
import { Separator } from "@/tiptap-ui-primitive/separator"

type ButtonGroupOrientation = "horizontal" | "vertical"

function getButtonGroupClassName(orientation: ButtonGroupOrientation) {
  return cn(
    "tiptap-button-group",
    orientation === "vertical"
      ? "tiptap-button-group-vertical"
      : "tiptap-button-group-horizontal"
  )
}

const ButtonGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: ButtonGroupOrientation
  }
>(({ className, orientation = "horizontal", ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      data-slot="tiptap-button-group"
      data-orientation={orientation}
      className={cn(getButtonGroupClassName(orientation), className)}
      {...props}
    />
  )
})

ButtonGroup.displayName = "ButtonGroup"

const ButtonGroupText = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("tiptap-button-group-text", className)}
        {...props}
      />
    )
  }
)

ButtonGroupText.displayName = "ButtonGroupText"

const ButtonGroupSeparator = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Separator>
>(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-slot="tiptap-button-group-separator"
      orientation={orientation}
      className={cn("tiptap-button-group-separator", className)}
      {...props}
    />
  )
})

ButtonGroupSeparator.displayName = "ButtonGroupSeparator"

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
