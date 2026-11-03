namespace CarsAPI.Data;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int PageNumber,
    int PageSize,
    int TotalCount);

public static class Pagination
{
    public const int DefaultPageSize = 50;
    public const int MaxPageSize = 100;

    public static bool IsValid(int pageNumber, int pageSize) =>
        pageNumber > 0 && pageSize > 0 && pageSize <= MaxPageSize &&
        (long)(pageNumber - 1) * pageSize <= int.MaxValue;
}
