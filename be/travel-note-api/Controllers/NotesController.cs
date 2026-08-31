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
    public async Task<ActionResult<IEnumerable<NoteDto>>> GetAll([FromQuery] Guid? parentId, CancellationToken ct)
    {
        var query = db.Notes.AsNoTracking();

        query = parentId is null
            ? query.Where(n => n.ParentId == null)
            : query.Where(n => n.ParentId == parentId);

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

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<SearchResultDto>>> Search([FromQuery] string? term, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return Ok(Array.Empty<SearchResultDto>());
        }

        // SQLite LIKE is case-insensitive for ASCII; escape user-supplied wildcards.
        var pattern = $"%{term.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_")}%";
        var matches = await db.Notes.AsNoTracking()
            .Where(n => EF.Functions.Like(n.Title, pattern, "\\") || EF.Functions.Like(n.Description, pattern, "\\"))
            .OrderBy(n => n.Title)
            .ToListAsync(ct);

        var results = new List<SearchResultDto>(matches.Count);
        foreach (var match in matches)
        {
            results.Add(new SearchResultDto(ToDto(match), await GetAncestors(match.ParentId, ct)));
        }

        return Ok(results);
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create([FromBody] NoteInput input, CancellationToken ct)
    {
        if (input.ParentId is not null && !await db.Notes.AnyAsync(n => n.Id == input.ParentId, ct))
        {
            return BadRequest("The selected parent location does not exist.");
        }

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

        if (input.ParentId != note.ParentId)
        {
            return BadRequest("A note-location cannot be moved to a different parent.");
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

    private async Task<IReadOnlyList<AncestorDto>> GetAncestors(Guid? parentId, CancellationToken ct)
    {
        var ancestors = new List<AncestorDto>();
        while (parentId is not null)
        {
            var parent = await db.Notes.AsNoTracking()
                .Where(n => n.Id == parentId)
                .Select(n => new { n.Id, n.Title, n.ParentId })
                .FirstOrDefaultAsync(ct);
            if (parent is null)
            {
                break;
            }
            ancestors.Insert(0, new AncestorDto(parent.Id, parent.Title));
            parentId = parent.ParentId;
        }
        return ancestors;
    }
}
