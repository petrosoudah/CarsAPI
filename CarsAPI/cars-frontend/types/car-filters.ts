export type CarFiltersProps = {
    search: string;
    availability: string;
    onSearchChange: (value: string) => void;
    onAvailabilityChange: (value: string) => void;
    onClear: () => void;
};