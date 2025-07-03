class Item {
  final int id;
  final String title;
  final String description;
  final String slug;
  final double price;
  final String? image;
  final String size;
  final String? labels;
  final String? labelColour;
  final String category;

  Item({
    required this.id,
    required this.title,
    required this.description,
    required this.slug,
    required this.price,
    this.image,
    required this.size,
    this.labels,
    this.labelColour,
    required this.category,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      slug: json['slug'],
      price: double.parse(json['price'].toString()),
      image: json['image'],
      size: json['size'],
      labels: json['labels'],
      labelColour: json['label_colour'],
      category: json['category'],
    );
  }
} 