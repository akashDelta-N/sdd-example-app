using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using travel_note_api.Controllers;
using travel_note_api.Data;
using travel_note_api.Dtos;
using travel_note_api.Models;
using Xunit;

namespace travel_note_api.Tests;

public class NotesControllerTests
{
    [Fact]
    public async Task Search_returns_results_within_two_seconds_for_95_percent_of_queries_across_1000_locations()
    {
        await using var db = CreateContext();
        var locations = Enumerable.Range(0, 1000)
            .Select(index => CreateNote(title: $"Location {index:D4}", description: $"Travel note {index:D4}"));
        db.Notes.AddRange(locations);
        await db.SaveChangesAsync();
        var controller = new NotesController(db);
        var durations = new List<TimeSpan>();

        for (var index = 0; index < 20; index++)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await controller.Search($"{index * 50:D4}", CancellationToken.None);
            stopwatch.Stop();
            Assert.NotEmpty(Assert.IsAssignableFrom<IEnumerable<SearchResultDto>>(Assert.IsType<OkObjectResult>(result.Result).Value));
            durations.Add(stopwatch.Elapsed);
        }

        Assert.True(durations.Count(duration => duration < TimeSpan.FromSeconds(2)) >= 19);
    }

    [Fact]
    public async Task Update_archives_a_childless_location_and_allows_restore()
    {
        await using var db = CreateContext();
        var note = CreateNote();
        db.Notes.Add(note);
        await db.SaveChangesAsync();

        var archive = await new NotesController(db).Update(note.Id, Input(isArchived: true), CancellationToken.None);
        var restore = await new NotesController(db).Update(note.Id, Input(isArchived: false), CancellationToken.None);

        Assert.IsType<NoContentResult>(archive);
        Assert.IsType<NoContentResult>(restore);
        Assert.False((await db.Notes.FindAsync(note.Id))!.IsArchived);
    }

    [Fact]
    public async Task Update_rejects_archiving_a_location_with_children()
    {
        await using var db = CreateContext();
        var parent = CreateNote();
        db.Notes.AddRange(parent, CreateNote(parent.Id));
        await db.SaveChangesAsync();

        var result = await new NotesController(db).Update(parent.Id, Input(isArchived: true), CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Delete_requires_an_archived_childless_location()
    {
        await using var db = CreateContext();
        var active = CreateNote();
        var archivedParent = CreateNote(isArchived: true);
        var archivedLeaf = CreateNote(isArchived: true);
        db.Notes.AddRange(active, archivedParent, CreateNote(archivedParent.Id), archivedLeaf);
        await db.SaveChangesAsync();
        var controller = new NotesController(db);

        var activeResult = await controller.Delete(active.Id, CancellationToken.None);
        var parentResult = await controller.Delete(archivedParent.Id, CancellationToken.None);
        var leafResult = await controller.Delete(archivedLeaf.Id, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(activeResult);
        Assert.IsType<BadRequestObjectResult>(parentResult);
        Assert.IsType<NoContentResult>(leafResult);
    }

    [Fact]
    public async Task Search_matches_title_and_description_and_returns_ordered_ancestors()
    {
        await using var db = CreateContext();
        var root = CreateNote(title: "Japan");
        var child = CreateNote(root.Id, "Tokyo", "Historic district");
        db.Notes.AddRange(root, child);
        await db.SaveChangesAsync();

        var result = await new NotesController(db).Search("historic", CancellationToken.None);

        var responses = Assert.IsAssignableFrom<IEnumerable<SearchResultDto>>(Assert.IsType<OkObjectResult>(result.Result).Value);
        var response = Assert.Single(responses);
        Assert.Equal(child.Id, response.Note.Id);
        Assert.Collection(response.Ancestors, ancestor => Assert.Equal(root.Id, ancestor.Id));
    }

    [Fact]
    public async Task Search_treats_like_wildcards_as_literal_text()
    {
        await using var db = CreateContext();
        db.Notes.AddRange(CreateNote(title: "100% match"), CreateNote(title: "100X match"));
        await db.SaveChangesAsync();

        var result = await new NotesController(db).Search("100%", CancellationToken.None);

        var responses = Assert.IsAssignableFrom<IEnumerable<SearchResultDto>>(Assert.IsType<OkObjectResult>(result.Result).Value);
        Assert.Single(responses);
    }

    [Fact]
    public async Task Create_rejects_an_unknown_parent()
    {
        await using var db = CreateContext();
        var input = Input(parentId: Guid.NewGuid());

        var result = await new NotesController(db).Create(input, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Empty(db.Notes);
    }

    [Fact]
    public async Task Create_assigns_a_guid_and_persists_a_valid_parent()
    {
        await using var db = CreateContext();
        var parent = CreateNote();
        db.Notes.Add(parent);
        await db.SaveChangesAsync();

        var result = await new NotesController(db).Create(Input(parent.Id), CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result).Value;
        var response = Assert.IsType<NoteDto>(created);
        Assert.NotEqual(Guid.Empty, response.Id);
        Assert.Equal(parent.Id, response.ParentId);
    }

    [Fact]
    public async Task Update_rejects_a_changed_parent()
    {
        await using var db = CreateContext();
        var originalParent = CreateNote();
        var otherParent = CreateNote();
        var child = CreateNote(originalParent.Id);
        db.Notes.AddRange(originalParent, otherParent, child);
        await db.SaveChangesAsync();

        var result = await new NotesController(db).Update(child.Id, Input(otherParent.Id), CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(originalParent.Id, (await db.Notes.FindAsync(child.Id))!.ParentId);
    }

    [Fact]
    public async Task GetAll_returns_only_root_locations_when_parent_is_not_supplied()
    {
        await using var db = CreateContext();
        var root = CreateNote();
        db.Notes.AddRange(root, CreateNote(root.Id));
        await db.SaveChangesAsync();

        var result = await new NotesController(db).GetAll(null, CancellationToken.None);

        var notes = Assert.IsType<OkObjectResult>(result.Result).Value;
        var response = Assert.IsAssignableFrom<IEnumerable<NoteDto>>(notes);
        var note = Assert.Single(response);
        Assert.Equal(root.Id, note.Id);
        Assert.Equal(1, note.ChildCount);
    }

    [Fact]
    public async Task GetAll_returns_direct_children_for_parent_id()
    {
        await using var db = CreateContext();
        var root = CreateNote();
        var child = CreateNote(root.Id);
        var grandchild = CreateNote(child.Id);
        db.Notes.AddRange(root, child, grandchild);
        await db.SaveChangesAsync();

        var result = await new NotesController(db).GetAll(root.Id, CancellationToken.None);

        var notes = Assert.IsType<OkObjectResult>(result.Result).Value;
        var response = Assert.IsAssignableFrom<IEnumerable<NoteDto>>(notes);
        var note = Assert.Single(response);
        Assert.Equal(child.Id, note.Id);
        Assert.Equal(1, note.ChildCount);
    }

    private static NotesDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<NotesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new NotesDbContext(options);
    }

    private static Note CreateNote(Guid? parentId = null, string title = "Location", string description = "", bool isArchived = false) => new()
    {
        Id = Guid.NewGuid(),
        ParentId = parentId,
        Title = title,
        Description = description,
        Latitude = 35.0m,
        Longitude = 139.0m,
        IsArchived = isArchived,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    private static NoteInput Input(Guid? parentId = null, bool isArchived = false) => new()
    {
        Title = "New location",
        Description = string.Empty,
        Latitude = 35.0m,
        Longitude = 139.0m,
        ParentId = parentId,
        IsArchived = isArchived
    };
}