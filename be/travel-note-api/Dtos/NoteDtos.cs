using System.ComponentModel.DataAnnotations;

namespace travel_note_api.Dtos;

public record NoteDto(int Id, string Title, string Body, DateTime CreatedAt, DateTime UpdatedAt);

public class NoteInput
{
    [Required(AllowEmptyStrings = false)]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(20000)]
    public string Body { get; set; } = string.Empty;
}
