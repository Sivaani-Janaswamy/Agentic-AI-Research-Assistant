class Paper {
  final String id;
  final String title;
  final String? authors;
  final String? abstract;
  final String? pdfUrl;
  final String? category;
  final DateTime? publishDate;

  Paper({
    required this.id,
    required this.title,
    this.authors,
    this.abstract,
    this.pdfUrl,
    this.category,
    this.publishDate,
  });

  factory Paper.fromJson(Map<String, dynamic> json) {
    return Paper(
      id: json['id']?.toString() ?? json['external_id']?.toString() ?? '',
      title: json['title'] ?? '',
      authors: json['authors'],
      abstract: json['abstract'],
      pdfUrl: json['pdf_url'],
      category: json['category'],
      publishDate: json['publish_date'] != null 
          ? DateTime.tryParse(json['publish_date']) 
          : null,
    );
  }
}

class User {
  final String id;
  final String email;
  final String fullName;

  User({
    required this.id,
    required this.email,
    required this.fullName,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
    );
  }
}

class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final User user;

  AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['access_token'] ?? '',
      refreshToken: json['refresh_token'] ?? '',
      user: User.fromJson(json['user'] ?? {}),
    );
  }
}
