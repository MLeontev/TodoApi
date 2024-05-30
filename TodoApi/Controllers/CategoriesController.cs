using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    // GET: api/Categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(long id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null) return NotFound();

        return category;
    }

    // PUT: api/Categories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategory(long id, Category category)
    {
        if (id != category.Id) return BadRequest();

        var existingCategory = await _context.Categories
            .Where(c => c.Name == category.Name && c.Id != id)
            .FirstOrDefaultAsync();

        if (existingCategory != null)
        {
            return BadRequest(new { message = "Категория с таким названием уже существует." });
        }
        
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
    public async Task<ActionResult<Category>> PostCategory(Category category)
    {
        if (await _context.Categories.AnyAsync(c => c.Name == category.Name))
        {
            return Conflict(new { message = "Такая категория уже добавлена." });
        }
        
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetCategory", new { id = category.Id }, category);
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