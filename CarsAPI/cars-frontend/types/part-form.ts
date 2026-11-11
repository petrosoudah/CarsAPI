import type { Part } from "@/lib/api/parts-api";
import type { PartDetails } from "@/lib/api/parts-api";

export type PartFormDialogProps = {
    part?: Part | null | undefined;
    onClose: () => void;
    onSubmit: (details: PartDetails) => void;
    isSubmitting?: boolean;
};