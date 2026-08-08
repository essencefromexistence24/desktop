import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { Button } from "@/components/ui/button";

function MyTooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export function Test() {
  return (
    <MyTooltipTrigger
      render={
        <Button variant="secondary" size="icon-sm">
          hi
        </Button>
      }
    >
      trigger
    </MyTooltipTrigger>
  );
}
