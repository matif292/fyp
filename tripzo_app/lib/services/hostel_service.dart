import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/hostel.dart';

class HostelService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<Hostel>> search({
    String? city,
    String? propertyType,
    List<String>? amenities,
    double? minRating,
    double? minPrice,
    double? maxPrice,
  }) async {
    final res = await _dio.get('/hostels', queryParameters: {
      if (city != null && city.isNotEmpty) 'city': city,
      if (propertyType != null) 'property_type': propertyType,
      if (amenities != null && amenities.isNotEmpty) 'amenities': amenities.join(','),
      if (minRating != null) 'rating': minRating,
      if (minPrice != null) 'min_price': minPrice,
      if (maxPrice != null) 'max_price': maxPrice,
    });
    final list = (res.data is List) ? res.data : (res.data['hostels'] ?? res.data['data'] ?? []);
    return (list as List).map((e) => Hostel.fromJson(e)).toList();
  }

  Future<Hostel> getById(int id) async {
    final res = await _dio.get('/hostels/$id');
    final data = res.data['hostel'] ?? res.data;
    return Hostel.fromJson(data);
  }

  Future<List<RoomType>> getRooms(int hostelId) async {
    final res = await _dio.get('/hostels/$hostelId/rooms');
    final list = (res.data is List) ? res.data : (res.data['rooms'] ?? []);
    return (list as List).map((e) => RoomType.fromJson(e)).toList();
  }

  Future<List<dynamic>> getItinerary(int hostelId) async {
    final res = await _dio.get('/hostels/$hostelId/itinerary');
    final list = (res.data is List) ? res.data : (res.data['itinerary'] ?? []);
    return list as List;
  }

  Future<List<Hostel>> ownerHostels() async {
    final res = await _dio.get('/hostels/owner/hostels');
    final list = (res.data is List) ? res.data : (res.data['hostels'] ?? []);
    return (list as List).map((e) => Hostel.fromJson(e)).toList();
  }

  Future<void> createHostel(Map<String, dynamic> fields, List<String> photoPaths) async {
    final formMap = <String, dynamic>{...fields};
    if (photoPaths.isNotEmpty) {
      formMap['photos'] = [for (final p in photoPaths) await MultipartFile.fromFile(p)];
    }
    await _dio.post('/hostels', data: FormData.fromMap(formMap));
  }

  Future<void> updateHostel(int id, Map<String, dynamic> fields) async {
    await _dio.put('/hostels/$id', data: fields);
  }

  Future<void> addRoom(int hostelId, Map<String, dynamic> fields) async {
    await _dio.post('/hostels/$hostelId/rooms', data: fields);
  }
}
