using System.ComponentModel.DataAnnotations;

namespace travel_note_api.Dtos;

public record NoteDto(Guid Id, string Title, string Body, double Latitude, double Longitude, Guid? ParentId, bool IsArchived, DateTime CreatedAt, DateTime UpdatedAt);

public class NoteInput
{
    [Required(AllowEmptyStrings = false)]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(20000)]
    public string Body { get; set; } = string.Empty;

    [Required]
    [Range(-90, 90)]
    public double? Latitude { get; set; }

    [Required]
    [Range(-180, 180)]
    public double? Longitude { get; set; }

    public Guid? ParentId { get; set; }
}
