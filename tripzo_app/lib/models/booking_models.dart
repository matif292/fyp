class Booking {
  final int id;
  final int hostelId;
  final String? hostelName;
  final int? roomId;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final int guests;
  final double totalPrice;
  final String status; // pending/confirmed/checked_in/checked_out/cancelled
  final String paymentStatus; // pending/paid/refunded

  Booking({
    required this.id,
    required this.hostelId,
    this.hostelName,
    this.roomId,
    this.checkIn,
    this.checkOut,
    required this.guests,
    required this.totalPrice,
    required this.status,
    required this.paymentStatus,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic v) {
      if (v == null) return null;
      return DateTime.tryParse(v.toString());
    }

    return Booking(
      id: json['id'] ?? 0,
      hostelId: json['hostel_id'] ?? 0,
      hostelName: json['hostel_name'],
      roomId: json['room_id'],
      checkIn: parseDate(json['check_in_date'] ?? json['check_in']),
      checkOut: parseDate(json['check_out_date'] ?? json['check_out']),
      guests: int.tryParse(json['guests']?.toString() ?? '1') ?? 1,
      totalPrice: double.tryParse(json['total_price']?.toString() ?? '0') ?? 0,
      status: json['status'] ?? 'pending',
      paymentStatus: json['payment_status'] ?? 'pending',
    );
  }
}

class Negotiation {
  final int id;
  final int hostelId;
  final String? hostelName;
  final double offerPrice;
  final double? counterOffer;
  final String status; // pending/accepted/rejected/countered

  Negotiation({
    required this.id,
    required this.hostelId,
    this.hostelName,
    required this.offerPrice,
    this.counterOffer,
    required this.status,
  });

  factory Negotiation.fromJson(Map<String, dynamic> json) {
    return Negotiation(
      id: json['id'] ?? 0,
      hostelId: json['hostel_id'] ?? 0,
      hostelName: json['hostel_name'],
      offerPrice: double.tryParse(json['offer_price']?.toString() ?? '0') ?? 0,
      counterOffer: json['counter_offer'] != null
          ? double.tryParse(json['counter_offer'].toString())
          : null,
      status: json['status'] ?? 'pending',
    );
  }
}

class Review {
  final int id;
  final int hostelId;
  final int rating;
  final String? comment;
  final String? travelerName;
  final DateTime? createdAt;

  Review({
    required this.id,
    required this.hostelId,
    required this.rating,
    this.comment,
    this.travelerName,
    this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? 0,
      hostelId: json['hostel_id'] ?? 0,
      rating: int.tryParse(json['rating']?.toString() ?? '0') ?? 0,
      comment: json['comment'],
      travelerName: json['full_name'] ?? json['traveler_name'],
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null,
    );
  }
}

class AppNotification {
  final int id;
  final String title;
  final String message;
  final bool isRead;
  final DateTime? createdAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Notification',
      message: json['message'] ?? '',
      isRead: (json['is_read'] == 1 || json['is_read'] == true),
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null,
    );
  }
}
