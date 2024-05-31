namespace TodoApi.DTOs.TodoItem;

public class TodoItemCreateDto
{
    public string Name { get; set; }

    public long CategoryId { get; set; }
}