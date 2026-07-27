class AppUser {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final String role; // traveler | owner | admin
  final String? profilePhoto;

  AppUser({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    required this.role,
    this.profilePhoto,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] ?? json['user_id'] ?? 0,
      fullName: json['full_name'] ?? json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'traveler',
      profilePhoto: json['profile_photo'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'full_name': fullName,
        'email': email,
        'phone': phone,
        'role': role,
        'profile_photo': profilePhoto,
      };
}
