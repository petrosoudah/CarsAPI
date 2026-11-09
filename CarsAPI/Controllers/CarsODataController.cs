using CarsAPI.Data;
using CarsAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.Controllers;

public class CarsController(AppDbContext context) : ODataController
{
    [EnableQuery(PageSize = 50, MaxTop = 100)]
    public IQueryable<Cars> Get()
    {
        return context.Cars.AsNoTracking();
    }

    [EnableQuery]
    public ActionResult<Cars> Get(int key)
    {
        var car = context.Cars.AsNoTracking().FirstOrDefault(c => c.Id == key);
        if (car == null) return NotFound();
        return Ok(car);
    }
}