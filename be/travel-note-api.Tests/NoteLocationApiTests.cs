using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace travel_note_api.Tests;

public sealed class NoteLocationApiTests : IClassFixture<NoteLocationApiFactory>
{
    private readonly HttpClient client;

    public NoteLocationApiTests(NoteLocationApiFactory factory) => client = factory.CreateClient();

    [Fact]
    public async Task CreateRejectsMissingOrInvalidCoordinates()
    {
        var missing = await client.PostAsJsonAsync("/api/notes", new { title = "Tokyo", body = "", longitude = 139.65, parentId = (int?)null });
        var invalid = await client.PostAsJsonAsync("/api/notes", new { title = "Tokyo", body = "", latitude = 91, longitude = 139.65, parentId = (int?)null });

        Assert.Equal(HttpStatusCode.BadRequest, missing.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }

    [Fact]
    public async Task CreateRejectsMissingAndArchivedParents()
    {
        var missing = await Create("Asakusa", 35.71, 139.79, Guid.NewGuid());
        var parent = await Create("Tokyo", 35.67, 139.65, null);
        Assert.Equal(HttpStatusCode.Created, parent.StatusCode);
        var parentId = (await parent.Content.ReadFromJsonAsync<NoteResponse>())!.Id;
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync($"/api/notes/{parentId}/archive", null)).StatusCode);

        var archived = await Create("Asakusa", 35.71, 139.79, parentId);
        Assert.Equal(HttpStatusCode.BadRequest, missing.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, archived.StatusCode);
    }

    [Fact]
    public async Task UpdateRejectsParentCycle()
    {
        var root = await CreateNote("Japan", 36.2, 138.2, null);
        var child = await CreateNote("Tokyo", 35.67, 139.65, root.Id);
        var response = await client.PutAsJsonAsync($"/api/notes/{root.Id}", new { title = root.Title, body = "", latitude = root.Latitude, longitude = root.Longitude, parentId = child.Id });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ArchiveRejectsActiveChildrenAndAllowsArchivedChildren()
    {
        var parent = await CreateNote("Japan", 36.2, 138.2, null);
        var child = await CreateNote("Tokyo", 35.67, 139.65, parent.Id);

        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsync($"/api/notes/{parent.Id}/archive", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync($"/api/notes/{child.Id}/archive", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync($"/api/notes/{parent.Id}/archive", null)).StatusCode);
    }

    [Fact]
    public async Task DeleteRequiresArchivedLeaf()
    {
        var note = await CreateNote("Senso-ji", 35.71, 139.79, null);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.DeleteAsync($"/api/notes/{note.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync($"/api/notes/{note.Id}/archive", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/notes/{note.Id}")).StatusCode);
    }

    private Task<HttpResponseMessage> Create(string title, double latitude, double longitude, Guid? parentId) =>
        client.PostAsJsonAsync("/api/notes", new { title, body = "", latitude, longitude, parentId });

    private async Task<NoteResponse> CreateNote(string title, double latitude, double longitude, Guid? parentId)
    {
        var response = await Create(title, latitude, longitude, parentId);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<NoteResponse>())!;
    }

    private sealed record NoteResponse(Guid Id, string Title, double Latitude, double Longitude);
}

public sealed class NoteLocationApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Notes", $"Data Source={Path.Combine(Path.GetTempPath(), $"travel-notes-tests-{Guid.NewGuid():N}.db")}");
    }
}