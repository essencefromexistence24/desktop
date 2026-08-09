"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/features/editor/components/inspector-fields";
import { useCoalescedLayerEdit } from "@/features/editor/hooks/use-coalesced-layer-edit";
import type { TimelineLayer } from "@/lib/editor/types";

type InspectorTextSectionProps = {
  layer: TimelineLayer;
};

export function InspectorTextSection({ layer }: InspectorTextSectionProps) {
  const edit = useCoalescedLayerEdit(layer.id);

  return (
    <>
      <Field label="Name">
        <Input
          value={layer.name}
          onChange={(event) => edit.update({ name: event.target.value })}
          onBlur={edit.endSession}
        />
      </Field>
      {"text" in layer || layer.kind === "text" ? (
        <Field label="Text">
          <Textarea
            value={layer.text ?? ""}
            onChange={(event) => edit.update({ text: event.target.value })}
            onBlur={edit.endSession}
          />
        </Field>
      ) : null}
    </>
  );
}
