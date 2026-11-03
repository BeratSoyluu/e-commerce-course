namespace API.Services;

public record ImageSaveResult(string? FileName, string? Error);

public class ImageService
{
    public const long MaxFileSize = 2 * 1024 * 1024; //? 2 MB

    //? Uzantı -> dosyanın gerçekten o tür olduğunu gösteren ilk baytlar ("magic number")
    private static readonly Dictionary<string, byte[][]> Signatures = new()
    {
        [".jpg"] = [[0xFF, 0xD8, 0xFF]],
        [".jpeg"] = [[0xFF, 0xD8, 0xFF]],
        [".png"] = [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
        [".webp"] = [[0x52, 0x49, 0x46, 0x46]], //? "RIFF"; 8-11. baytlar ayrıca "WEBP" olmalı (aşağıda)
    };

    private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png", "image/webp"];

    private readonly IWebHostEnvironment _env;

    public ImageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    private string ImagesFolder => Path.Combine(_env.WebRootPath, "images");

    public async Task<ImageSaveResult> Save(IFormFile file)
    {
        if (file.Length == 0) return new(null, "Dosya boş.");
        if (file.Length > MaxFileSize) return new(null, "Görsel en fazla 2 MB olabilir.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!Signatures.ContainsKey(extension) || !AllowedContentTypes.Contains(file.ContentType))
            return new(null, "Sadece JPG, PNG veya WEBP yüklenebilir.");

        //! Uzantı ve Content-Type istemcinin beyanıdır, kolayca sahtelenir. Dosyanın ilk baytlarına bakarak
        //! "resim.jpg" adıyla yüklenen bir script/HTML dosyasını reddediyoruz.
        var header = new byte[12];
        await using (var stream = file.OpenReadStream())
        {
            var read = await stream.ReadAsync(header);
            if (read < header.Length) return new(null, "Geçersiz görsel dosyası.");
        }
        var validSignature = Signatures[extension].Any(sig => header.AsSpan(0, sig.Length).SequenceEqual(sig));
        if (extension == ".webp")
            validSignature &= header.AsSpan(8, 4).SequenceEqual("WEBP"u8);
        if (!validSignature) return new(null, "Dosya içeriği uzantısıyla uyuşmuyor.");

        //! Kullanıcının verdiği dosya adı hiç kullanılmıyor: "../../appsettings.json" gibi yol saldırıları ve
        //! aynı adla başka bir ürünün görselinin üzerine yazılması bu sayede imkansız.
        var fileName = $"{Guid.NewGuid()}{extension}";
        Directory.CreateDirectory(ImagesFolder);
        await using (var target = File.Create(Path.Combine(ImagesFolder, fileName)))
        {
            await file.CopyToAsync(target);
        }
        return new(fileName, null);
    }

    //? Sadece bizim yüklediğimiz (Guid adlı) dosyalar silinir; seed görselleri (1.jpg...) korunur.
    public void Delete(string? fileName)
    {
        if (string.IsNullOrEmpty(fileName) || !Guid.TryParse(Path.GetFileNameWithoutExtension(fileName), out _)) return;

        var path = Path.Combine(ImagesFolder, Path.GetFileName(fileName));
        if (File.Exists(path)) File.Delete(path);
    }
}
