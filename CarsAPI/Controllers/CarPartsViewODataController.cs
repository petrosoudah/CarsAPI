using CarsAPI.Data;
using CarsAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.Controllers;

[Route("odata/CarPartsView")]
public class CarPartsViewODataController(AppDbContext context) : ODataController
{
    [EnableQuery(PageSize = 50, MaxTop = 100)]
    public IQueryable<CarPartsView> Get()
    {
        return context.CarPartsView.AsNoTracking();
    }

    [EnableQuery]
    public ActionResult<CarPartsView> Get(Guid key)
    {
        var item = context.CarPartsView.AsNoTracking().FirstOrDefault(p => p.PartId == key);
        if (item == null) return NotFound();
        return Ok(item);
    }
}