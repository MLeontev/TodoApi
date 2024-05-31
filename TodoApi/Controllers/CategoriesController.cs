using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.DTOs.Category;
using TodoApi.DTOs.TodoItem;
using TodoApi.Models;

namespace TodoApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly TodoContext _context;

    public CategoriesController(TodoContext context)
    {
        _context = context;
    }

    // GET: api/Categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryWithoutItemsDto>>> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => new CategoryWithoutItemsDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/Categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryWithoutItemsDto>> GetCategory(long id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null) return NotFound();

        var categoryDto = new CategoryWithoutItemsDto
        {
            Id = category.Id,
            Name = category.Name
        };

        return Ok(categoryDto);
    }
    
    // GET: api/Categories/5/TodoItems
    [HttpGet("{id}/TodoItems")]
    public async Task<ActionResult<IEnumerable<TodoItemWithCategoryName>>> GetTodoItemsByCategory(long id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null) return NotFound();

        var todoItems = await _context.TodoItems
            .Where(t => t.Category.Id == id)
            .Include(t => t.Category)
            .Select(t => new TodoItemWithCategoryName
            {
                Id = t.Id,
                Name = t.Name,
                IsComplete = t.IsComplete,
                CategoryName = t.Category.Name
            })
            .ToListAsync();
        
        return Ok(todoItems);
    }

    // PUT: api/Categories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategory(long id, CategoryUpdateDto categoryDto)
    {
        var category = await _context.Categories.FindAsync(id);
        
        if (category == null)
        {
            return NotFound();
        }
        
        var existingCategory = await _context.Categories
            .Where(c => c.Name == categoryDto.Name && c.Id != id)
            .FirstOrDefaultAsync();

        if (existingCategory != null)
        {
            return BadRequest(new { message = "Категория с таким названием уже существует." });
        }
        
        category.Name = categoryDto.Name;
        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CategoryExists(id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    // POST: api/Categories
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<CategoryWithoutItemsDto>> PostCategory(CategoryCreateDto categoryDto)
    {
        if (await _context.Categories.AnyAsync(c => c.Name == categoryDto.Name))
        {
            return Conflict(new { message = "Такая категория уже добавлена." });
        }
        
        var category = new Category
        {
            Name = categoryDto.Name
        };
        
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var categoryWithoutItemsDto = new CategoryWithoutItemsDto
        {
            Id = category.Id,
            Name = category.Name
        };
        
        return CreatedAtAction("GetCategory", new { id = category.Id }, categoryWithoutItemsDto);
    }

    // DELETE: api/Categories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(long id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CategoryExists(long id)
    {
        return _context.Categories.Any(e => e.Id == id);
    }
}