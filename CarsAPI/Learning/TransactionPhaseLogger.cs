using System.Transactions;

namespace CarsAPI.Learning
{
    public sealed class TransactionPhaseLogger : IEnlistmentNotification

    {
        public void Prepare(PreparingEnlistment preparingEnlistment)
        {
            Console.WriteLine("[Transaction demo] PREPARE: voting ready");
            preparingEnlistment.Prepared();


        }

        public void Commit(Enlistment enlistment)
        {
            Console.WriteLine("[Transaction demo] COMMIT recieved");
            enlistment.Done();
        }

        public void Rollback(Enlistment enlistment)
        {
            Console.WriteLine("[Transaction demo] ROLLBACK recieved");
            enlistment.Done();
        }

        public void InDoubt(Enlistment enlistment)
        {
            Console.WriteLine("[Transaction demo] Outcome UNKOWN");
            enlistment.Done();
        }
    }
}
