namespace World.Injection
{
    public class DocumentExaminer
    {
        private readonly IDocumetReader _documetReader;

        public DocumentExaminer(IDocumetReader documetReader)
        {
            _documetReader = documetReader;

        }

        public void DoSomeReading() 
        {
            _documetReader.Read();
        }
    }

    public interface IDocumetReader
    {
        void Read();
    }

    public interface IDocumentParser
    {
        void Parse();
    }
}