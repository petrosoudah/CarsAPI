import type { Part } from "@/lib/api/parts-api";

export type DeletePartDialogProps = {
    part: Part;
    onClose: () => void;
    onDeleted: (id: string) => void;
    onDeletingChange: (deleting: boolean) => void;
};