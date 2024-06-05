namespace TodoApi.DTOs.TodoItem;

public class TodoItemWithCategoryName
{
    public long Id { get; set; }

    public string Name { get; set; }

    public bool IsComplete { get; set; }
    
    public long CategoryId { get; set; }
    
    public string CategoryName { get; set; }
}