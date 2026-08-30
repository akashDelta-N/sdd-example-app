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
    public async Task<ActionResult<IEnumerable<NoteDto>>> GetAll([FromQuery] string? search, [FromQuery] bool includeArchived, CancellationToken ct)
    {
        var query = db.Notes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            // SQLite LIKE is case-insensitive for ASCII; escape user-supplied wildcards.
            var pattern = $"%{search.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_")}%";
            query = query.Where(n => EF.Functions.Like(n.Title, pattern, "\\"));
        }

        if (!includeArchived) query = query.Where(n => !n.IsArchived);

        var notes = await query
            .OrderByDescending(n => n.UpdatedAt)
            .Select(n => ToDto(n))
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
        var parentError = await ValidateParent(input.ParentId, null, ct);
        if (parentError is not null) return BadRequest(parentError);
        var note = new Note
        {
            Title = input.Title.Trim(),
            Body = input.Body,
            Latitude = input.Latitude!.Value,
            Longitude = input.Longitude!.Value,
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

        var parentError = await ValidateParent(input.ParentId, id, ct);
        if (parentError is not null) return BadRequest(parentError);
        note.Title = input.Title.Trim();
        note.Body = input.Body;
        note.Latitude = input.Latitude!.Value;
        note.Longitude = input.Longitude!.Value;
        note.ParentId = input.ParentId;
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

        if (!note.IsArchived) return BadRequest("Archive a note-location before deleting it.");
        if (await db.Notes.AnyAsync(n => n.ParentId == id, ct)) return BadRequest("Delete child note-locations first.");
        db.Notes.Remove(note);
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        var note = await db.Notes.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (note is null) return NotFound();
        if (await db.Notes.AnyAsync(n => n.ParentId == id && !n.IsArchived, ct)) return BadRequest("Archive active child note-locations first.");
        note.IsArchived = true;
        note.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<string?> ValidateParent(Guid? parentId, Guid? noteId, CancellationToken ct)
    {
        if (parentId is null) return null;
        if (parentId == noteId) return "A note-location cannot be its own parent.";
        var parent = await db.Notes.AsNoTracking().FirstOrDefaultAsync(n => n.Id == parentId, ct);
        if (parent is null) return "The selected parent does not exist.";
        if (parent.IsArchived) return "The selected parent is archived.";
        while (parent.ParentId is Guid ancestorId)
        {
            if (ancestorId == noteId) return "A note-location cannot be moved below one of its children.";
            parent = await db.Notes.AsNoTracking().FirstOrDefaultAsync(n => n.Id == ancestorId, ct);
            if (parent is null) break;
        }
        return null;
    }

    private static NoteDto ToDto(Note n) => new(n.Id, n.Title, n.Body, n.Latitude, n.Longitude, n.ParentId, n.IsArchived, n.CreatedAt, n.UpdatedAt);
}
