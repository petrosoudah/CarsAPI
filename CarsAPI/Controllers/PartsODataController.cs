using CarsAPI.Data;
using CarsAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.Controllers;

public class PartsController(AppDbContext context) : ODataController
{
    [EnableQuery(PageSize = 50, MaxTop = 100)]
    public IQueryable<Parts> Get()
    {
        return context.Parts.AsNoTracking();
    }

    [EnableQuery]
    public ActionResult<Parts> Get(Guid key)
    {
        var part = context.Parts.AsNoTracking().FirstOrDefault(p => p.Id == key);
        if (part == null) return NotFound();
        return Ok(part);
    }
}