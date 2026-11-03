using System.Globalization;
using API.DTO;
using API.Entity;
using Iyzipay.Model;
using Iyzipay.Request;
using Options = Iyzipay.Options;

namespace API.Services;

public record PaymentResult(bool Success, string? ErrorMessage, string? PaymentId);

public class PaymentService
{
    private readonly IConfiguration _config;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(IConfiguration config, ILogger<PaymentService> logger)
    {
        _config = config;
        _logger = logger;
    }

    //? Anahtarlar user-secrets'tan gelir (dotnet user-secrets set "Iyzico:ApiKey" ...). Repoda asla durmaz.
    private string? ApiKey => _config["Iyzico:ApiKey"];
    private string? SecretKey => _config["Iyzico:SecretKey"];

    public async Task<PaymentResult> ProcessPayment(Order order, CardDTO card, string email, string ip)
    {
        //! Anahtar yoksa uygulama çökmez; ödeme başarılı sayılır. Böylece projeyi klonlayan biri iyzico hesabı olmadan da
        //! sipariş akışını deneyebilir. Gerçek ortamda anahtarların tanımlı olduğundan emin olun.
        if (string.IsNullOrEmpty(ApiKey) || string.IsNullOrEmpty(SecretKey))
        {
            _logger.LogWarning("iyzico anahtarları tanımlı değil, sipariş {OrderId} için ödeme simüle edildi.", order.Id);
            return new PaymentResult(true, null, null);
        }

        var options = new Options
        {
            ApiKey = ApiKey,
            SecretKey = SecretKey,
            BaseUrl = _config["Iyzico:BaseUrl"] ?? "https://sandbox-api.iyzipay.com"
        };

        var total = order.GetTotal();
        var fullName = $"{order.FirstName} {order.LastName}";
        var address = new Address
        {
            ContactName = fullName,
            City = order.City,
            Country = "Turkey",
            Description = order.AddressLine
        };

        //! iyzico, sepet kalemlerinin toplamının Price'a kuruşu kuruşuna eşit olmasını ister. Kargo da bir kalem olarak ekleniyor.
        var basketItems = order.OrderItems.Select(item => new BasketItem
        {
            Id = item.ProductId.ToString(),
            Name = item.ProductName,
            Category1 = "Saat",
            ItemType = BasketItemType.PHYSICAL.ToString(),
            Price = FormatPrice(item.Price * item.Quantity)
        }).ToList();

        if (order.DeliveryFee > 0)
        {
            basketItems.Add(new BasketItem
            {
                Id = "KARGO",
                Name = "Kargo",
                Category1 = "Kargo",
                ItemType = BasketItemType.PHYSICAL.ToString(),
                Price = FormatPrice(order.DeliveryFee)
            });
        }

        var request = new CreatePaymentRequest
        {
            Locale = Locale.TR.ToString(),
            ConversationId = order.Id.ToString(),
            Price = FormatPrice(total),
            PaidPrice = FormatPrice(total),
            Currency = Currency.TRY.ToString(),
            Installment = 1,
            BasketId = order.Id.ToString(),
            PaymentChannel = PaymentChannel.WEB.ToString(),
            PaymentGroup = PaymentGroup.PRODUCT.ToString(),
            PaymentCard = new PaymentCard
            {
                CardHolderName = card.CardHolderName,
                CardNumber = card.CardNumber,
                ExpireMonth = card.ExpireMonth,
                ExpireYear = card.ExpireYear,
                Cvc = card.Cvc,
                RegisterCard = 0 //! Kartı iyzico'da da saklatmıyoruz
            },
            Buyer = new Buyer
            {
                Id = order.CustomerId,
                Name = order.FirstName,
                Surname = order.LastName,
                GsmNumber = "+90" + order.Phone.TrimStart('0'),
                Email = email,
                //! iyzico T.C. kimlik no istiyor. Sandbox için dokümandaki örnek değer; canlıda kullanıcıdan alınmalı.
                IdentityNumber = "74300864791",
                RegistrationAddress = order.AddressLine,
                Ip = ip,
                City = order.City,
                Country = "Turkey"
            },
            ShippingAddress = address,
            BillingAddress = address,
            BasketItems = basketItems
        };

        try
        {
            var payment = await Payment.Create(request, options);

            if (payment.Status == "success")
                return new PaymentResult(true, null, payment.PaymentId);

            //? Sadece iyzico'nun hata kodu ve mesajı loglanıyor; istek (kart bilgisi içerir) loglanmıyor.
            _logger.LogWarning("Sipariş {OrderId} ödemesi reddedildi: {ErrorCode} {ErrorMessage}", order.Id, payment.ErrorCode, payment.ErrorMessage);
            return new PaymentResult(false, payment.ErrorMessage ?? "Ödeme reddedildi.", null);
        }
        catch (Exception ex)
        {
            //! Exception'ın kendisini loglamıyoruz: içinde istek gövdesi olabilir. Sadece tipi yeterli.
            _logger.LogError("Sipariş {OrderId} için iyzico'ya ulaşılamadı: {ExceptionType}", order.Id, ex.GetType().Name);
            return new PaymentResult(false, "Ödeme sağlayıcısına ulaşılamadı, lütfen tekrar deneyin.", null);
        }
    }

    //! Ondalık ayırıcı nokta olmalı ("7000.00"). tr-TR kültüründe ToString() "7000,00" üretir ve iyzico reddeder.
    private static string FormatPrice(decimal value) => value.ToString("0.00", CultureInfo.InvariantCulture);
}
