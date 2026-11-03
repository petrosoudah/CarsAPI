DECLARE @CarId INT = 1;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Update the car price
    UPDATE dbo.Cars
    SET Price = ISNULL(Price, 0) + 150
    WHERE Id = @CarId;

    -- Ensure the car exists
    IF @@ROWCOUNT = 0
        THROW 50001, 'Car not found.', 1;

    -- Insert the replacement part
    INSERT INTO dbo.Parts
        (Manufacturer, Description, Price, CarId)
    VALUES
        ('Bosch', 'Brake Pads', 150.00, @CarId);

    COMMIT TRANSACTION;

    PRINT 'Transaction committed successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;