class Review {
  final int id;
  final dynamic user; // Can be changed to String if username is returned, or a user object if needed
  final String review;
  final DateTime postedOn;

  Review({
    required this.id,
    required this.user,
    required this.review,
    required this.postedOn,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      user: json['user'], // Adjust if you want username or user object
      review: json['review'],
      postedOn: DateTime.parse(json['posted_on']),
    );
  }
} 