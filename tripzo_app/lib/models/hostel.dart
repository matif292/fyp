class Hostel {
  final int id;
  final String name;
  final String city;
  final String? propertyType;
  final String? description;
  final double? rating;
  final int? reviewCount;
  final double? minPrice;
  final List<String> photos;
  final List<String> amenities;
  final double? latitude;
  final double? longitude;
  final String status;

  Hostel({
    required this.id,
    required this.name,
    required this.city,
    this.propertyType,
    this.description,
    this.rating,
    this.reviewCount,
    this.minPrice,
    this.photos = const [],
    this.amenities = const [],
    this.latitude,
    this.longitude,
    this.status = 'approved',
  });

  factory Hostel.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic v) {
      if (v == null) return [];
      if (v is List) return v.map((e) => e.toString()).toList();
      if (v is String) {
        try {
          final trimmed = v.trim();
          if (trimmed.startsWith('[')) {
            return trimmed
                .replaceAll(RegExp(r'[\[\]"]'), '')
                .split(',')
                .map((e) => e.trim())
                .where((e) => e.isNotEmpty)
                .toList();
          }
          return [v];
        } catch (_) {
          return [];
        }
      }
      return [];
    }

    return Hostel(
      id: json['id'] ?? 0,
      name: json['name'] ?? json['hostel_name'] ?? '',
      city: json['city'] ?? '',
      propertyType: json['property_type'],
      description: json['description'],
      rating: json['avg_rating'] != null
          ? double.tryParse(json['avg_rating'].toString())
          : (json['rating'] != null ? double.tryParse(json['rating'].toString()) : null),
      reviewCount: json['review_count'] != null
          ? int.tryParse(json['review_count'].toString())
          : null,
      minPrice: json['min_price'] != null
          ? double.tryParse(json['min_price'].toString())
          : (json['price'] != null ? double.tryParse(json['price'].toString()) : null),
      photos: parseList(json['photos']),
      amenities: parseList(json['amenities']),
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      status: json['status'] ?? 'approved',
    );
  }
}

class RoomType {
  final int id;
  final int hostelId;
  final String name;
  final double price;
  final int capacity;
  final int availableRooms;
  final String? description;
  final List<String> includes;

  RoomType({
    required this.id,
    required this.hostelId,
    required this.name,
    required this.price,
    required this.capacity,
    required this.availableRooms,
    this.description,
    this.includes = const [],
  });

  factory RoomType.fromJson(Map<String, dynamic> json) {
    List<String> includes = [];
    // Web app note: JSON.parse(room.includes) needs a try/catch —
    // malformed data shouldn't crash the screen.
    try {
      final raw = json['includes'];
      if (raw is List) {
        includes = raw.map((e) => e.toString()).toList();
      } else if (raw is String && raw.trim().isNotEmpty) {
        final trimmed = raw.trim();
        if (trimmed.startsWith('[')) {
          includes = trimmed
              .replaceAll(RegExp(r'[\[\]"]'), '')
              .split(',')
              .map((e) => e.trim())
              .where((e) => e.isNotEmpty)
              .toList();
        }
      }
    } catch (_) {
      includes = [];
    }

    return RoomType(
      id: json['id'] ?? 0,
      hostelId: json['hostel_id'] ?? 0,
      name: json['room_type'] ?? json['name'] ?? 'Room',
      price: double.tryParse(json['price_per_night']?.toString() ?? json['price']?.toString() ?? '0') ?? 0,
      capacity: int.tryParse(json['capacity']?.toString() ?? '1') ?? 1,
      availableRooms: int.tryParse(json['available_rooms']?.toString() ?? '0') ?? 0,
      description: json['description'],
      includes: includes,
    );
  }
}
