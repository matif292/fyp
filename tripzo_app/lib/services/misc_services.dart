import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/booking_models.dart';

class WaitingListService {
  final Dio _dio = ApiClient.instance.dio;

  Future<void> join(Map<String, dynamic> payload) async {
    await _dio.post('/waiting-list', data: payload);
  }

  Future<List<dynamic>> mine() async {
    final res = await _dio.get('/waiting-list');
    return (res.data is List) ? res.data : (res.data['items'] ?? []);
  }

  Future<void> leave(int id) async {
    await _dio.delete('/waiting-list/$id');
  }
}

class NotificationService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<AppNotification>> list() async {
    final res = await _dio.get('/notifications');
    final list = (res.data is List) ? res.data : (res.data['notifications'] ?? []);
    return (list as List).map((e) => AppNotification.fromJson(e)).toList();
  }

  Future<int> unreadCount() async {
    final res = await _dio.get('/notifications/unread-count');
    final data = res.data;
    return int.tryParse((data is Map ? (data['count'] ?? data['unread_count']) : data)?.toString() ?? '0') ?? 0;
  }

  Future<void> readAll() async {
    await _dio.put('/notifications/read-all');
  }

  Future<void> markRead(int id) async {
    await _dio.put('/notifications/$id/read');
  }
}

class TripService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<dynamic>> list() async {
    final res = await _dio.get('/trips');
    return (res.data is List) ? res.data : (res.data['trips'] ?? []);
  }

  Future<List<dynamic>> groups() async {
    final res = await _dio.get('/trips/groups');
    return (res.data is List) ? res.data : (res.data['groups'] ?? []);
  }

  Future<List<dynamic>> myStatuses() async {
    final res = await _dio.get('/trips/my-statuses');
    return (res.data is List) ? res.data : (res.data['statuses'] ?? []);
  }

  Future<Map<String, dynamic>> getById(int id) async {
    final res = await _dio.get('/trips/$id');
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<void> create(Map<String, dynamic> payload) async {
    await _dio.post('/trips', data: payload);
  }

  Future<void> agree(int id) async => _dio.post('/trips/$id/agree');
  Future<void> decline(int id) async => _dio.post('/trips/$id/decline');

  Future<List<dynamic>> joinRequests(int id) async {
    final res = await _dio.get('/trips/$id/join-requests');
    return (res.data is List) ? res.data : (res.data['requests'] ?? []);
  }

  Future<void> approveJoin(int tripId, int userId) async =>
      _dio.put('/trips/$tripId/join-requests/$userId/approve');
  Future<void> rejectJoin(int tripId, int userId) async =>
      _dio.put('/trips/$tripId/join-requests/$userId/reject');

  Future<void> leaveGroup(int groupId) async => _dio.post('/trips/groups/$groupId/leave');

  Future<void> addMemory(int groupId, Map<String, dynamic> payload) async =>
      _dio.post('/trips/groups/$groupId/memories', data: payload);

  Future<List<dynamic>> memories(int groupId) async {
    final res = await _dio.get('/trips/groups/$groupId/memories');
    return (res.data is List) ? res.data : (res.data['memories'] ?? []);
  }
}

class PackageService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<dynamic>> forHostel(int hostelId) async {
    final res = await _dio.get('/packages/hostel/$hostelId');
    return (res.data is List) ? res.data : (res.data['packages'] ?? []);
  }

  Future<void> book(int packageId, Map<String, dynamic> payload) async =>
      _dio.post('/packages/$packageId/book', data: payload);

  Future<void> create(Map<String, dynamic> payload) async => _dio.post('/packages', data: payload);
}

class WeatherService {
  final Dio _dio = ApiClient.instance.dio;

  Future<Map<String, dynamic>> get({required String city, String? date}) async {
    final res = await _dio.get('/weather', queryParameters: {
      'city': city,
      if (date != null) 'date': date,
    });
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<List<dynamic>> alerts() async {
    final res = await _dio.get('/weather/alerts');
    return (res.data is List) ? res.data : (res.data['alerts'] ?? []);
  }
}

class BudgetService {
  final Dio _dio = ApiClient.instance.dio;

  Future<Map<String, dynamic>> recommendations() async {
    final res = await _dio.get('/budget/recommendations');
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<void> save(Map<String, dynamic> payload) async => _dio.post('/budget/save', data: payload);
}

class ChatbotService {
  final Dio _dio = ApiClient.instance.dio;

  Future<String> sendMessage(String message) async {
    final res = await _dio.post('/chatbot/message', data: {'message': message});
    final data = res.data;
    if (data is Map) return (data['reply'] ?? data['message'] ?? '').toString();
    return data.toString();
  }

  Future<List<dynamic>> history() async {
    final res = await _dio.get('/chatbot/history');
    return (res.data is List) ? res.data : (res.data['history'] ?? []);
  }

  Future<void> clearHistory() async => _dio.delete('/chatbot/history');
}

class ChatService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<dynamic>> conversations() async {
    final res = await _dio.get('/chat/conversations');
    return (res.data is List) ? res.data : (res.data['conversations'] ?? []);
  }

  Future<Map<String, dynamic>> startConversation(Map<String, dynamic> payload) async {
    final res = await _dio.post('/chat/conversations', data: payload);
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<List<dynamic>> messages(int conversationId) async {
    final res = await _dio.get('/chat/conversations/$conversationId/messages');
    return (res.data is List) ? res.data : (res.data['messages'] ?? []);
  }

  Future<void> sendMessage(int conversationId, String text) async {
    await _dio.post('/chat/conversations/$conversationId/messages', data: {'message': text});
  }

  Future<void> markRead(int conversationId) async {
    await _dio.put('/chat/conversations/$conversationId/read');
  }
}

class AdminService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<dynamic>> pendingApprovals() async {
    final res = await _dio.get('/admin/pending-approvals');
    return (res.data is List) ? res.data : (res.data['approvals'] ?? []);
  }

  Future<void> approveOwner(int id) async => _dio.put('/admin/approve/$id');
  Future<void> rejectOwner(int id) async => _dio.put('/admin/reject/$id');

  Future<List<dynamic>> users() async {
    final res = await _dio.get('/admin/users');
    return (res.data is List) ? res.data : (res.data['users'] ?? []);
  }

  Future<void> toggleUserStatus(int id) async => _dio.put('/admin/users/$id/toggle-status');

  Future<Map<String, dynamic>> stats() async {
    final res = await _dio.get('/admin/stats');
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<Map<String, dynamic>> sentimentOverview() async {
    final res = await _dio.get('/admin/sentiment-overview');
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }

  Future<List<dynamic>> hostels() async {
    final res = await _dio.get('/admin/hostels');
    return (res.data is List) ? res.data : (res.data['hostels'] ?? []);
  }

  Future<void> toggleHostelStatus(int id) async => _dio.put('/admin/hostels/$id/toggle-status');

  Future<Map<String, dynamic>> settings() async {
    final res = await _dio.get('/admin/settings');
    return Map<String, dynamic>.from(res.data is Map ? res.data : {});
  }
}
