using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using travel_note_api.Data;
using travel_note_api.Dtos;
using travel_note_api.Models;

namespace travel_note_api.Controllers;

[ApiController]
[Route("api/notes")]
public class NotesController(NotesDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NoteDto>>> GetAll([FromQuery] string? search, CancellationToken ct)
    {
        var query = db.Notes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            // SQLite LIKE is case-insensitive for ASCII; escape user-supplied wildcards.
            var pattern = $"%{search.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_")}%";
            query = query.Where(n =>
                EF.Functions.Like(n.Title, pattern, "\\") || EF.Functions.Like(n.Body, pattern, "\\"));
        }

        var notes = await query
            .OrderByDescending(n => n.UpdatedAt)
            .Select(n => new NoteDto(n.Id, n.Title, n.Body, n.CreatedAt, n.UpdatedAt))
            .ToListAsync(ct);

        return Ok(notes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<NoteDto>> GetById(int id, CancellationToken ct)
    {
        var note = await db.Notes.AsNoTracking().FirstOrDefaultAsync(n => n.Id == id, ct);
        return note is null ? NotFound() : Ok(ToDto(note));
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create([FromBody] NoteInput input, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var note = new Note
        {
            Title = input.Title.Trim(),
            Body = input.Body,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Notes.Add(note);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = note.Id }, ToDto(note));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] NoteInput input, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (note is null)
        {
            return NotFound();
        }

        note.Title = input.Title.Trim();
        note.Body = input.Body;
        note.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (note is null)
        {
            return NotFound();
        }

        db.Notes.Remove(note);
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    private static NoteDto ToDto(Note n) => new(n.Id, n.Title, n.Body, n.CreatedAt, n.UpdatedAt);
}
