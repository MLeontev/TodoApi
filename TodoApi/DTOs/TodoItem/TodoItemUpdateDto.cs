namespace TodoApi.DTOs.TodoItem;

public class TodoItemUpdateDto
{
    public string Name { get; set; }

    public bool IsComplete { get; set; }

    public long CategoryId { get; set; }
}