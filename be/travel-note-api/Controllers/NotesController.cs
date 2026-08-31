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
                EF.Functions.Like(n.Title, pattern, "\\") || EF.Functions.Like(n.Description, pattern, "\\"));
        }

        var notes = await query
            .OrderByDescending(n => n.UpdatedAt)
            .Select(n => new NoteDto(
                n.Id, n.Title, n.Description, n.Latitude, n.Longitude, n.ParentId,
                n.IsArchived, n.Children.Count, n.CreatedAt, n.UpdatedAt))
            .ToListAsync(ct);

        return Ok(notes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoteDto>> GetById(Guid id, CancellationToken ct)
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
            Id = Guid.NewGuid(),
            Title = input.Title.Trim(),
            Description = input.Description,
            Latitude = input.Latitude,
            Longitude = input.Longitude,
            ParentId = input.ParentId,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Notes.Add(note);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = note.Id }, ToDto(note));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NoteInput input, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (note is null)
        {
            return NotFound();
        }

        note.Title = input.Title.Trim();
        note.Description = input.Description;
        note.Latitude = input.Latitude;
        note.Longitude = input.Longitude;
        note.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
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

    private static NoteDto ToDto(Note n) => new(
        n.Id, n.Title, n.Description, n.Latitude, n.Longitude, n.ParentId,
        n.IsArchived, n.Children.Count, n.CreatedAt, n.UpdatedAt);
}
