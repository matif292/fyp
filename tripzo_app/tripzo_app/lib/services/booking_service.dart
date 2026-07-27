import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/booking_models.dart';

class BookingService {
  final Dio _dio = ApiClient.instance.dio;

  Future<Booking> create(Map<String, dynamic> payload) async {
    final res = await _dio.post('/bookings', data: payload);
    final data = res.data['booking'] ?? res.data;
    return Booking.fromJson(data);
  }

  Future<List<Booking>> myBookings() async {
    final res = await _dio.get('/bookings/my-bookings');
    final list = (res.data is List) ? res.data : (res.data['bookings'] ?? []);
    return (list as List).map((e) => Booking.fromJson(e)).toList();
  }

  Future<List<Booking>> hostelBookings(int hostelId) async {
    final res = await _dio.get('/bookings/hostel/$hostelId');
    final list = (res.data is List) ? res.data : (res.data['bookings'] ?? []);
    return (list as List).map((e) => Booking.fromJson(e)).toList();
  }

  Future<Booking> getById(int id) async {
    final res = await _dio.get('/bookings/$id');
    final data = res.data['booking'] ?? res.data;
    return Booking.fromJson(data);
  }

  Future<void> updateStatus(int id, String status) async {
    await _dio.put('/bookings/$id/status', data: {'status': status});
  }

  Future<void> cancel(int id) async {
    await _dio.put('/bookings/$id/cancel');
  }

  Future<void> updatePayment(int id, String paymentStatus) async {
    await _dio.put('/bookings/$id/payment', data: {'payment_status': paymentStatus});
  }
}

class NegotiationService {
  final Dio _dio = ApiClient.instance.dio;

  Future<void> makeOffer(Map<String, dynamic> payload) async {
    await _dio.post('/negotiations', data: payload);
  }

  Future<List<Negotiation>> myOffers() async {
    final res = await _dio.get('/negotiations/my');
    final list = (res.data is List) ? res.data : (res.data['negotiations'] ?? []);
    return (list as List).map((e) => Negotiation.fromJson(e)).toList();
  }

  Future<void> acceptCounter(int id) async {
    await _dio.post('/negotiations/$id/accept-counter');
  }

  Future<List<Negotiation>> ownerOffers() async {
    final res = await _dio.get('/negotiations/hostel-owner');
    final list = (res.data is List) ? res.data : (res.data['negotiations'] ?? []);
    return (list as List).map((e) => Negotiation.fromJson(e)).toList();
  }

  Future<void> respond(int id, {required String action, double? counterOffer}) async {
    await _dio.put('/negotiations/$id/respond', data: {
      'action': action,
      if (counterOffer != null) 'counter_offer': counterOffer,
    });
  }

  Future<Map<String, dynamic>> getRules(int hostelId) async {
    final res = await _dio.get('/negotiations/hostel/$hostelId/rules');
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<void> updateRules(int hostelId, Map<String, dynamic> rules) async {
    await _dio.put('/negotiations/hostel/$hostelId/rules', data: rules);
  }
}

class ReviewService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<Review>> forHostel(int hostelId) async {
    final res = await _dio.get('/reviews/hostel/$hostelId');
    final list = (res.data is List) ? res.data : (res.data['reviews'] ?? []);
    return (list as List).map((e) => Review.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> sentiment(int hostelId) async {
    final res = await _dio.get('/reviews/hostel/$hostelId/sentiment');
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<void> create({required int bookingId, required int hostelId, required int rating, String? comment}) async {
    await _dio.post('/reviews', data: {
      'booking_id': bookingId,
      'hostel_id': hostelId,
      'rating': rating,
      'comment': comment,
    });
  }

  Future<List<Review>> myReviews() async {
    final res = await _dio.get('/reviews/my-reviews');
    final list = (res.data is List) ? res.data : (res.data['reviews'] ?? []);
    return (list as List).map((e) => Review.fromJson(e)).toList();
  }

  Future<void> update(int id, {int? rating, String? comment}) async {
    await _dio.put('/reviews/$id', data: {
      if (rating != null) 'rating': rating,
      if (comment != null) 'comment': comment,
    });
  }

  Future<void> delete(int id) async {
    await _dio.delete('/reviews/$id');
  }
}
