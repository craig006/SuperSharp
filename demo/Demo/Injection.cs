namespace World.Injection
{
    public class DocumentExaminer
    {

        private readonly IDocumentParser _screenReader;

        private readonly IDocumetReader _documetReader;

        public DocumentExaminer(IDocumentParser screenReader, IDocumetReader documetReader)
        {
            _documetReader = documetReader;
            _screenReader = screenReader;

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