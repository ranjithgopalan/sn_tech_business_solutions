from django.db import models
from django.utils import timezone

class Customer(models.Model):
    customerName = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    address = models.TextField()
    gstin = models.CharField(max_length=15, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.customerName

class Product(models.Model):

    user = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='products',
        null=False,  # Ensures user cannot be null
        blank=False  # Ensures user is required in forms
    )
    user = models.ForeignKey(Customer, related_name='products', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=100)
    product_price = models.FloatField()
    product_quantity = models.IntegerField()
    invoice_number = models.CharField(max_length=20, unique=True)
    invoice_date = models.DateField(default=timezone.now)
    total_amount = models.FloatField()

    def __str__(self):
        return self.product_name

class Cart(models.Model):
    user = models.ForeignKey(Customer, related_name='carts', on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through='CartItem')
    created_at = models.DateTimeField(default=timezone.now)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    added_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.product.product_name} ({self.quantity})"
    
class Summary(models.Model):
    user = models.ForeignKey(Customer, related_name='summary', on_delete=models.CASCADE)
    total_amount = models.FloatField(null=True)
    total_products = models.IntegerField(null=True)
    
    def __str__(self):
        return self.total_amount
    
