using System.ComponentModel.DataAnnotations;

namespace travel_note_api.Dtos;

public record NoteDto(
    Guid Id,
    string Title,
    string Description,
    decimal Latitude,
    decimal Longitude,
    Guid? ParentId,
    bool IsArchived,
    int ChildCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record SearchResultDto(NoteDto Note, IReadOnlyList<AncestorDto> Ancestors);

public record AncestorDto(Guid Id, string Title);

public class NoteInput
{
    [Required(AllowEmptyStrings = false)]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(20000)]
    public string Description { get; set; } = string.Empty;

    [Range(-90, 90)]
    public decimal Latitude { get; set; }

    [Range(-180, 180)]
    public decimal Longitude { get; set; }

    public Guid? ParentId { get; set; }

    public bool IsArchived { get; set; }
}
