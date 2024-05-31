using System.Text.Json.Serialization;

namespace TodoApi.Models;

public class TodoItem
{
    public long Id { get; set; }

    public string Name { get; set; }

    public bool IsComplete { get; set; }

    public long CategoryId { get; set; }
    
    public Category Category { get; set; }
}