using System.Text.Json.Serialization;

namespace TodoApi.Models;

public class Category
{
    public long Id { get; set; }

    public string Name { get; set; }
    
    public List<TodoItem> TodoItems { get; set; }
}