export type CarPaginationProps = {
    pageNumber: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (page: number) => void;
};