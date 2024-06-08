using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.DTOs.TodoItem;
using TodoApi.Models;

namespace TodoApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TodoItemsController : ControllerBase
{
    private readonly TodoContext _context;

    public TodoItemsController(TodoContext context)
    {
        _context = context;
    }

    // GET: api/TodoItems
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoItemWithCategoryName>>> GetTodoItems()
    {
        return await _context.TodoItems
            .Include(t => t.Category)
            .OrderByDescending(t => t.Id)
            .Select(t => new TodoItemWithCategoryName()
            {
                Id = t.Id,
                Name = t.Name,
                IsComplete = t.IsComplete,
                CategoryId = t.Category.Id,
                CategoryName = t.Category.Name
            })
            .ToListAsync();
    }

    // GET: api/TodoItems/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TodoItemWithCategoryName>> GetTodoItem(long id)
    {
        var todoItem = await _context.TodoItems.FindAsync(id);

        if (todoItem == null) return NotFound();
        
        var category = await _context.Categories.FindAsync(todoItem.CategoryId);

        var todoDto = new TodoItemWithCategoryName
        {
            Id = todoItem.Id,
            Name = todoItem.Name,
            IsComplete = todoItem.IsComplete,
            CategoryId = category.Id,
            CategoryName = category.Name
        };
        
        return Ok(todoDto);
    }

    // PUT: api/TodoItems/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTodoItem(long id, TodoItemUpdateDto todoDto)
    {
        var todoItem = await _context.TodoItems.FindAsync(id);
        
        if (todoItem == null)
        {
            return NotFound();
        }
        
        var newCategory = await _context.Categories.FindAsync(todoDto.CategoryId);

        todoItem.Name = todoDto.Name;
        todoItem.IsComplete = todoDto.IsComplete;
        todoItem.CategoryId = todoDto.CategoryId;
        todoItem.Category = newCategory;
        
        _context.Entry(todoItem).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TodoItemExists(id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    // POST: api/TodoItems
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<TodoItemWithCategoryName>> PostTodoItem(TodoItemCreateDto todoDto)
    {
        var category = await _context.Categories.FindAsync(todoDto.CategoryId);

        var todoItem = new TodoItem
        {
            Name = todoDto.Name,
            IsComplete = false,
            CategoryId = category.Id,
            Category = category
        };
        
        _context.TodoItems.Add(todoItem);
        await _context.SaveChangesAsync();

        var todoItemWithCategoryName = new TodoItemWithCategoryName
        {
            Id = todoItem.Id,
            Name = todoItem.Name,
            IsComplete = todoItem.IsComplete,
            CategoryId = category.Id,
            CategoryName = category.Name
        };

        return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItemWithCategoryName);
    }

    // DELETE: api/TodoItems/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTodoItem(long id)
    {
        var todoItem = await _context.TodoItems.FindAsync(id);
        if (todoItem == null) return NotFound();

        _context.TodoItems.Remove(todoItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TodoItemExists(long id)
    {
        return _context.TodoItems.Any(e => e.Id == id);
    }
}