namespace World.Things
{   
    public class Car
    {
        public int Id { get; set; }
        public string Make { get; set; } 

        public Car ()
        {
             
        }
    }

    public class Bus
    {
        public int Id { get; set; }
        public int WheelCount { get; set; }
    }

    public enum ThingType {
        Bus,
        Car,
        Train
    }

    public struct Category
    {
        public string Name { get; set; }
    }
    
    public interface ITrain
    {
        int Id { get; set; }
        int TopSpeed { get; set; }
    }

    public class Train
    {
        public int Id { get; set; }
        public int TopSpeed { get; set; }
    }
}