using CarsAPI.Data;
using CarsAPI.Domain.ValueObjects;
using CarsAPI.handlers_and_commands;
using CarsAPI.Validators;
using CarsAPI.Models;
using MediatR;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;
using Scalar.AspNetCore;
using System.Reflection;
using FluentValidation;
using CarsAPI.Exceptions;
using CarsAPI.Learning;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddValidatorsFromAssemblyContaining<AddCarsValidator>();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "SqlServerConnection")));
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(CarsAPI.Behaviors.ValidationBehavior<,>));

// Domain Event Dispatcher
builder.Services.AddScoped<CarsAPI.Domain.Events.DomainEventDispatcher>();

// OData configuration
builder.Services.AddControllers()
    .AddOData(opt => opt
        .AddRouteComponents("odata", GetEdmModel())
        .Select()
        .Filter()
        .OrderBy()
        .Expand()
        .Count()
        .SetMaxTop(100));
var frontendOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? (builder.Environment.IsDevelopment() ? ["http://localhost:3000"] : []);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(frontendOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("X-Total-Count");
    });
});




var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors("Frontend");

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    await dbContext.Database.MigrateAsync();
}
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features
            .Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()
            ?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        if (exception is FluentValidation.ValidationException validationException)
        {
            var errors = validationException.Errors
                .GroupBy(error => error.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.ErrorMessage).ToArray());

            await Results.ValidationProblem(errors)
                .ExecuteAsync(context);

            return;
        }

        if (exception is ConflictException conflictException)
        {
            await Results.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: conflictException.Message)
                .ExecuteAsync(context);

            return;
        }

        logger.LogError(
            exception,
            "Unhandled exception while processing {Method} {Path}",
            context.Request.Method,
            context.Request.Path);
        context.Response.StatusCode = 500;
        await Results.Problem(statusCode: 500)
            .ExecuteAsync(context);
    });
});

// Map controllers for OData
app.MapControllers();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();


    app.MapPost("/learning/transaction-scope", async (
        AppDbContext context,
        CancellationToken cancellationToken,
        bool simulateFailure = false) =>
    {
        var carId = await TransactionScopeDemo.RunAsync(
            context,
            simulateFailure,
            cancellationToken);

        return Results.Ok(new
        {
            carId,
            message = "Transaction committed."
        });
    });

}

app.MapGet("/cars", async (
    ISender mediator,
    HttpResponse response,
    CancellationToken cancellationToken,
    int pageNumber = 1,
    int pageSize = Pagination.DefaultPageSize,
    string? search = null,
    bool? isAvailable = null) =>
{
    if (!Pagination.IsValid(pageNumber, pageSize))
        return Results.BadRequest("Page number must be positive and page size must be between 1 and 100.");

    var cars = await mediator.Send(new ListCars(pageNumber, pageSize, search, isAvailable), cancellationToken);
    response.Headers["X-Total-Count"] = cars.TotalCount.ToString(System.Globalization.CultureInfo.InvariantCulture);
    return Results.Ok(cars.Items);
});
app.MapGet("/cars/{id}", async (
    int id,
    ISender mediator) =>
{
    try
    {
        var car = await mediator.Send(new CarById(id));
        return Results.Ok(car);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
});
app.MapPut("/cars/{id}", async (
    int id,
    UpdateCar command,
    ISender mediator) =>
{
    if (id != command.Id)
        return Results.BadRequest("IDs do not match.");

    try
    {
        var updatedCar = await mediator.Send(command);
        return Results.Ok(updatedCar);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
});
app.MapPost("/cars", async (AddCars command, ISender mediator) =>
{
    var result = await mediator.Send(command);
    return Results.Created($"/cars/{result.Id}", result);
});
app.MapDelete("/cars/{id}", async (
    int id,
    ISender mediator) =>
{
    var deleted = await mediator.Send(
        new DeleteCar { Id = id });

    return deleted
        ? Results.NoContent()
        : Results.NotFound();
});

app.MapGet("/parts/list", async (
    ISender mediator,
    HttpResponse response,
    int pageNumber = 1,
    int pageSize = Pagination.DefaultPageSize) =>
{
    if (!Pagination.IsValid(pageNumber, pageSize))
        return Results.BadRequest(
            "Page number must be positive and page size must be between 1 and 100.");

    var parts = await mediator.Send(
        new GetParts(pageNumber, pageSize));

    response.Headers["X-Total-Count"] =
        parts.TotalCount.ToString(
            System.Globalization.CultureInfo.InvariantCulture);

    return Results.Ok(parts.Items);
});
app.MapPost("/parts/add", async (
    AddParts command,
    ISender mediator) =>
{
    var addedPart = await mediator.Send(command);
    return Results.Created(
        $"/parts/{addedPart.Id}", addedPart);
});
app.MapGet("/parts/{id}", async (
    Guid id,
    ISender mediator) =>
{
    try
    {
        var part = await mediator.Send(new GetPartById(id));
        return Results.Ok(part);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
});
app.MapPut("/parts/{id}", async (
    Guid id,
    UpdatePart command,
    ISender mediator) =>
{
    if (id != command.Id)
        return Results.BadRequest("IDs do not match.");
    try
    {
        var updatedPart = await mediator.Send(command);
        return Results.Ok(updatedPart);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
});

app.MapDelete("/parts/{id:guid}", async (
    Guid id,
    ISender mediator,
    CancellationToken cancellationToken) =>
{
    var deleted = await mediator.Send(new DeletePart(id), cancellationToken);
    return deleted ? Results.NoContent() : Results.NotFound();
});

app.MapGet("parts/view", async (
    ISender mediator,
    int pageNumber = 1,
    int pageSize = Pagination.DefaultPageSize) =>
{
    if (!Pagination.IsValid(pageNumber, pageSize))
        return Results.BadRequest("Page number must be positive and page size must be between 1 and 100.");

    var parts = await mediator.Send(new GetCarPartsView(pageNumber, pageSize));
    return Results.Ok(parts.Items);
});

if (app.Environment.IsDevelopment())
{
    app.MapGet("/debug/database", (AppDbContext context) =>
    {
        return Results.Ok(new
        {
            DatabasePath = context.Database.GetDbConnection().DataSource,
            DatabaseName = context.Database.GetDbConnection().Database
        });
    });
}

app.MapGet("/cars/by-make/{make}",
    async (string make, ISender mediator, int pageNumber = 1, int pageSize = Pagination.DefaultPageSize) =>
    {
        if (!Pagination.IsValid(pageNumber, pageSize))
            return Results.BadRequest("Page number must be positive and page size must be between 1 and 100.");

        var cars = await mediator.Send(new GetCarsByMake(make, pageNumber, pageSize));
        return Results.Ok(cars.Items);
    });
app.MapPut("/cars/{id}/price",
    async (int id, decimal newPrice, ISender mediator) =>
    {
        int rowsAffected = await mediator.Send(
            new UpdateCarPrice(id, newPrice));

        if (rowsAffected == 0)
            return Results.NotFound($"Car with ID {id} was not found.");

        return Results.Ok("Car price updated successfully.");
    });

app.MapGet("/cars/by-year/{year}",
    async (int year, ISender mediator, int pageNumber = 1, int pageSize = Pagination.DefaultPageSize) =>
    {
        if (!Pagination.IsValid(pageNumber, pageSize))
            return Results.BadRequest("Page number must be positive and page size must be between 1 and 100.");

        var cars = await mediator.Send(new GetCarByYear(year, pageNumber, pageSize));
        return Results.Ok(cars.Items);
    });
app.MapPost("/parts/install",
    async (InstallPart command, ISender mediator) =>
    {
        var partId = await mediator.Send(command);

        if (partId == null)
            return Results.NotFound("Car not found.");

        return Results.Ok(new
        {
            Message = "Part installed.",
            PartId = partId
        });
    });


// OData EDM Model
static IEdmModel GetEdmModel()
{
    var builder = new ODataConventionModelBuilder();

    // Value Objects (Price, Year, Horsepower) are readonly record structs - OData 9.x
    // doesn't support them as Complex Types. They map to primitive DB types (decimal, int).
    // We must Ignore them in the EDM model since they're not primitive CLR types.
    // The underlying DB columns work for filtering/ordering via EF Core ValueConverters.
    // OData exposes read-only computed properties (PriceAmount, YearValue, HorsepowerValue).

    var carsEntity = builder.EntitySet<Cars>("Cars").EntityType;
    carsEntity.HasKey(c => c.Id);
    carsEntity.Property(c => c.Make);
    carsEntity.Property(c => c.Model);
    carsEntity.Ignore(c => c.Year);       // VO: use YearValue
    carsEntity.Ignore(c => c.Horsepower); // VO: use HorsepowerValue
    carsEntity.Ignore(c => c.Price);      // VO: use PriceAmount
    carsEntity.Property(c => c.IsAvailable);
    carsEntity.Property(c => c.CreatedAt);
    carsEntity.Property(c => c.Color);
    carsEntity.Property(c => c.YearValue);       // Computed: Year.Value
    carsEntity.Property(c => c.HorsepowerValue); // Computed: Horsepower.Value
    carsEntity.Property(c => c.PriceAmount);     // Computed: Price.Amount
    carsEntity.HasMany(c => c.Parts);

    var partsEntity = builder.EntitySet<Parts>("Parts").EntityType;
    partsEntity.HasKey(p => p.Id);
    partsEntity.Property(p => p.Manufacturer);
    partsEntity.Property(p => p.Description);
    partsEntity.Ignore(p => p.Price); // VO: use PriceAmount
    partsEntity.Property(p => p.PriceAmount);    // Computed: Price.Amount
    partsEntity.Property(p => p.CarId);
    partsEntity.HasOptional(p => p.Car);

    // CarPartsView is a keyless view, excluded from OData entity sets
    return builder.GetEdmModel();
}

app.Run();
